import * as React from 'react'
import styled from 'styled-components'

import { ButtonTooltip } from 'src/common-ui/components'
import { AnnotationMode } from 'src/sidebar/annotations-sidebar/types'
import * as icons from 'src/common-ui/components/design-library/icons'

export interface Props extends AnnotationFooterEventProps {
    mode: AnnotationMode
    isEdited?: boolean
    timestamp?: string
    hasBookmark?: boolean
}

export interface AnnotationFooterEventProps {
    onDeleteConfirm: () => void
    onDeleteCancel: () => void
    onDeleteIconClick: () => void
    onEditConfirm: () => void
    onEditCancel: () => void
    onEditIconClick: () => void
    toggleBookmark: () => void
    onGoToAnnotation?: () => void
}

class AnnotationFooter extends React.Component<Props> {
    private renderDefaultFooter() {
        const { isEdited, timestamp, hasBookmark } = this.props

        return (
            <DefaultInnerFooterContainerStyled>
                <TimestampStyled>
                    {isEdited && <span>Last Edit: </span>}
                    {timestamp}
                </TimestampStyled>
                <DefaultFooterBtnContainerStyled>
                    <ButtonTooltip
                        position={'bottom'}
                        tooltipText={'Delete Note'}
                    >
                        <IconBox>
                            <IconStyled
                                onClick={this.props.onDeleteIconClick}
                                title="Delete note"
                                src={icons.trash}
                            />
                        </IconBox>
                    </ButtonTooltip>
                    <ButtonTooltip
                        position={'bottom'}
                        tooltipText={'Open in Page'}
                    >
                        {this.props.onGoToAnnotation && (
                            <IconBox>
                                <IconStyled
                                    onClick={this.props.onGoToAnnotation}
                                    title="Go to annotation"
                                    src={icons.goTo}
                                />
                            </IconBox>
                        )}
                    </ButtonTooltip>
                    <ButtonTooltip
                        position={'bottom'}
                        tooltipText={'Edit Note'}
                    >
                        <IconBox>
                            <IconStyled
                                onClick={this.props.onEditIconClick}
                                title="Edit note"
                                src={icons.edit}
                            />
                        </IconBox>
                    </ButtonTooltip>
                    <ButtonTooltip
                        position={'bottom'}
                        tooltipText={'Bookmark Note'}
                    >
                        <IconBox>
                            <IconStyled
                                onClick={this.props.toggleBookmark}
                                title="Toggle star"
                                src={hasBookmark ? icons.heartFull : icons.heartEmpty}
                            />
                        </IconBox>
                    </ButtonTooltip>
                </DefaultFooterBtnContainerStyled>
            </DefaultInnerFooterContainerStyled>
        )
    }

    private renderEditableFooter() {
        const { mode } = this.props

        let actionBtnText: string
        let actionBtnHandler: () => void
        let cancelBtnHandler: () => void

        if (mode === 'delete') {
            actionBtnText = 'Delete'
            actionBtnHandler = this.props.onDeleteConfirm
            cancelBtnHandler = this.props.onDeleteCancel
        } else if (mode === 'edit') {
            actionBtnText = 'Save'
            actionBtnHandler = this.props.onEditConfirm
            cancelBtnHandler = this.props.onEditCancel
        } else {
            return
        }

        return (
            <InnerFooterContainerStyled>
                {mode === 'delete' && (
                    <DeleteConfirmStyled>Really?</DeleteConfirmStyled>
                )}
                <BtnContainerStyled>
                    <ButtonTooltip
                        tooltipText="ctrl/cmd + Enter"
                        position="top"
                    >
                        <ActionBtnStyled onClick={actionBtnHandler}>
                            {actionBtnText}
                        </ActionBtnStyled>
                    </ButtonTooltip>
                    <CancelBtnStyled onClick={cancelBtnHandler}>
                        Cancel
                    </CancelBtnStyled>
                </BtnContainerStyled>
            </InnerFooterContainerStyled>
        )
    }

    render() {
        const { mode } = this.props

        return (
            <OuterFooterContainerStyled>
                {mode === 'default'
                    ? this.renderDefaultFooter()
                    : this.renderEditableFooter()}
            </OuterFooterContainerStyled>
        )
    }
}

export default AnnotationFooter

const ActionBtnStyled = styled.button`
    padding: 3px 8px 3px 8px;
    border-radius: radius3;
    font-weight: 500;

    box-sizing: border-box;
    cursor: pointer;
    font-size: 14px;
    border: none;
    font-weight: 700;
    outline: none;
    background: none;

    &:focus {
        background-color: #e8e8e8;
    }

    &:hover {
        background-color: #e8e8e8;
        color: rgb(54, 54, 46);
    }
`

const CancelBtnStyled = styled.button`
    padding: 3px 8px 3px 8px;
    border-radius: radius3;
    font-weight: 500;

    color: #f29d9d;

    box-sizing: border-box;
    cursor: pointer;
    font-size: 14px;
    border: none;
    outline: none;
    margin-right: -6px;
    background: transparent;

    &:focus {
        background-color: #e8e8e8;
    }

    &:hover {
        background-color: #e8e8e8;
        color: rgb(54, 54, 46);
    }
`

const BtnContainerStyled = styled.div`
    display: flex;
    flex-direction: row-reverse;
`

const InnerFooterContainerStyled = styled.div`
    width: 100%;
    display: flex;
    justify-content: flex-start;
    align-items: center;
    margin-left: 11px;
`

const OuterFooterContainerStyled = styled.div`
    display: flex;
    align-items: center;
    font-size: 13px;
    height: 25px;
    margin: 0 4px 4px 4px;
    box-sizing: border-box;
`

const DeleteConfirmStyled = styled.span`
    box-sizing: border-box;
    font-weight: 800;
    font-size: 15px;
    color: #000;
    margin-right: 5px;
`

const DefaultInnerFooterContainerStyled = styled.div`
    display: flex;
    align-items: center;
    justify-content: flex-end;
    width: 100%;
`

const TimestampStyled = styled.div`
    margin-right: auto;
    margin-left: 12px;
    font-size: 12px;
    font-weight: 400;
    color: #72727f;

    & .lastEdit {
        font-weight: 600;
        color: #72727f;
        margin: 0px;
    }
`

const DefaultFooterBtnContainerStyled = styled.div`
    display: grid;
    flex-direction: row;
    margin: 0 7px 3px;
    z-index: 0;
    grid-auto-flow: column;
    display: inline-grid;
    grid-gap: 3px;
`

const IconBox = styled.div `
    height: 24px;
    width: 24px;
    padding: 4px;
    border-radius: 3px;

    &:hover {
        opacity: 0.6;
        background-color: #e0e0e0;
    }


`
const IconStyled = styled.img`
    border: none;
    z-index: 2500;
    cursor: pointer;
    outline: none;
    border-radius: 3px;
    width: 100%;
    height: 100%;
    opacity: 0.6;
`
