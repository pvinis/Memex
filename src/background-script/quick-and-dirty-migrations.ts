import Dexie from 'dexie'
import Storex from '@worldbrain/storex'
import { Storage } from 'webextension-polyfill-ts'
import { URLNormalizer } from '@worldbrain/memex-url-utils'
import { SPECIAL_LIST_NAMES } from '@worldbrain/memex-storage/lib/lists/constants'

import { STORAGE_KEYS as IDXING_STORAGE_KEYS } from 'src/options/settings/constants'

export interface MigrationProps {
    db: Dexie
    storex: Storex
    normalizeUrl: URLNormalizer
    localStorage: Storage.LocalStorageArea
}

export interface Migrations {
    [storageKey: string]: (props: MigrationProps) => Promise<void>
}

export const migrations: Migrations = {
    /*
     * We wanted to add the ability to search for individual terms that can appear
     * in a list's name. So we've added a 'text' field and this migration populates it
     * with the existing name data.
     */
    'searchable-list-name': async ({ storex }) => {
        const lists = storex.collection('customLists')
        const data = (await lists.findAllObjects<any>({})).filter(
            ({ name }) => !Object.values(SPECIAL_LIST_NAMES).includes(name),
        )

        for (const { id, name } of data) {
            await lists.updateObjects({ id }, { searchableName: name })
        }
    },
    /*
     * We want to add indicies on two currently optional fields.
     * Add an index on an optional field is fine, it simply results in a sparse index.
     * Though we want to be able to query the entire dataset, hence the need for this migration.
     */
    'fill-out-empty-sync-log-fields': async ({ db }) => {
        await db
            .table('clientSyncLogEntry')
            .toCollection()
            .modify((entry) => {
                entry.sharedOn = entry.sharedOn ?? 0
                entry.needsIntegration = entry.needsIntegration ? 1 : 0
            })
    },
    /*
     * There was a bug in the ext where collection renames weren't also updating
     * the cache, resulting in out-of-sync cache to DB. Therefore seed the
     * collections suggestion cache with entries from the DB.
     */
    'reseed-collections-suggestion-cache': async ({ localStorage, db }) => {
        const cacheStorageKey = 'custom-lists_suggestions'

        const listEntries = await db.table('customLists').limit(10).toArray()
        const newCache: string[] = listEntries.map((entry) => entry.name)

        await localStorage.set({ [cacheStorageKey]: newCache })
    },
    /*
     * If pageUrl is undefined, then re-derive it from url field.
     */
    'annots-undefined-pageUrl-field': async ({ db, normalizeUrl }) => {
        await db
            .table('annotations')
            .toCollection()
            .filter((annot) => annot.pageUrl === undefined)
            .modify((annot) => {
                annot.pageUrl = normalizeUrl(annot.url)
            })
    },
    /*
     * If lastEdited is undefined, then set it to createdWhen value.
     */
    'annots-created-when-to-last-edited': async ({ db }) => {
        await db
            .table('annotations')
            .toCollection()
            .filter(
                (annot) =>
                    annot.lastEdited == null ||
                    (Object.keys(annot.lastEdited).length === 0 &&
                        annot.lastEdited.constructor === Object),
            )
            .modify((annot) => {
                annot.lastEdited = annot.createdWhen
            })
    },
    'unify-duped-mobile-lists': async ({ db }) => {
        const lists = await db
            .table('customLists')
            .where('name')
            .equals(SPECIAL_LIST_NAMES.MOBILE)
            .toArray()

        if (lists.length < 2) {
            return
        }

        const entries = [
            await db
                .table('pageListEntries')
                .where('listId')
                .equals(lists[0].id)
                .toArray(),
            await db
                .table('pageListEntries')
                .where('listId')
                .equals(lists[1].id)
                .toArray(),
        ] as any[]

        const listToKeep = entries[0].length > entries[1].length ? 0 : 1
        const listToRemove = listToKeep === 0 ? 1 : 0

        for (const entry of entries[listToRemove]) {
            await db
                .table('pageListEntries')
                .put({ ...entry, listId: lists[listToKeep].id })
        }

        await db
            .table('pageListEntries')
            .where('listId')
            .equals(lists[listToRemove].id)
            .delete()
        await db
            .table('customLists')
            .where('id')
            .equals(lists[listToRemove].id)
            .delete()
    },
    /*
     * There was a bug in the mobile app where new page meta data could be created for
     * a page shared from an unsupported app, meaning the URL (the main field used to
     * associate meta data with pages) was empty.
     */
    'remove-empty-url': async ({ db }) => {
        await db.table('tags').where('url').equals('').delete()
        await db.table('visits').where('url').equals('').delete()
        await db.table('annotations').where('pageUrl').equals('').delete()
        await db.table('pageListEntries').where('pageUrl').equals('').delete()
    },
    /**
     * There was a bug that caused all page entries added to a custom list to
     * contain a normalized URL as their full URL.
     */
    'denormalize-list-entry-full-urls': async ({ db }) => {
        await db
            .table('pageListEntries')
            .toCollection()
            .modify((entry) => {
                if (entry.fullUrl && !entry.fullUrl.startsWith('http')) {
                    entry.fullUrl = 'http://' + entry.fullUrl
                }
            })
    },
}
