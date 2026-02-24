/**
 * @license MIT
 * @copyright Copyright 2025 Modus Operandi Inc. All Rights Reserved.
 */

import { EditorState, TextSelection, Transaction } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
import { wrapIn } from 'prosemirror-commands';
import { Transform } from 'prosemirror-transform';
import { NodeType, ResolvedPos } from 'prosemirror-model';
import { UICommand } from '../../../core/src/UICommand';

// Simple SVG icon for Landscape
const LANDSCAPE_ICON = `
<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M4 6V18H20V6H4ZM2 6C2 4.89543 2.89543 4 4 4H20C21.1046 4 22 4.89543 22 6V18C22 19.1046 21.1046 20 20 20H4C2.89543 20 2 19.1046 2 18V6Z" fill="currentColor"/>
</svg>
`;

export class LandscapeCommand extends UICommand{
    // Properties often expected by Licit's toolbar/command system
    icon = LANDSCAPE_ICON;
    title = 'Toggle Landscape';

    isEnabled = (state: EditorState): boolean => {
        return true;
    };

    execute = (
        state: EditorState,
        dispatch?: (tr: Transaction) => void,
        view?: EditorView
    ): boolean => {
        return this.toggleLandscape(state, dispatch);
    };

waitForUserInput = (): Promise<null> => Promise.resolve(null);

  executeWithUserInput = (): boolean => false;

    isActive = (state: EditorState): boolean => {
        const { $from } = state.selection;
        const type = state.schema.nodes['landscape_section'];
        if (!type) {
            return false;
        }
        return $from.node(-1)?.type === type;
    };

    private toggleLandscape(
        state: EditorState,
        dispatch?: (tr: Transaction) => void
    ): boolean {
        const { $from, $to } = state.selection;
        const type = state.schema.nodes['landscape_section'];
        if (!type) {
            return false;
        }

        const depth = this.findLandscapeDepth($from, type);

        // If selection is inside a landscape node, unwrap it by removing the node wrapper
        if (depth > -1) {
            const nodeStart = $from.before(depth);
            const nodeEnd = $from.after(depth);
            const landscapeNode = $from.node(depth);

            if (dispatch) {
                // Delete the landscape node and insert its children (unwrap)
                let tr = state.tr;
                tr = tr.deleteRange(nodeStart, nodeEnd);
                tr = tr.insert(nodeStart, landscapeNode.content);

                // Map original selection position and place the cursor at a valid textblock
                const mappedPos = tr.mapping.map($from.pos);
                const safePos = Math.min(Math.max(0, mappedPos), tr.doc.content.size);

                // Ensure the selection lands inside a textblock; search forward then backward if needed
                let resolved = tr.doc.resolve(safePos);
                let posForSelection = safePos;
                if (!resolved.parent.isTextblock) {
                    // Try to find the nearest textblock position: search forward first
                    for (let i = safePos; i <= tr.doc.content.size; i++) {
                        const r = tr.doc.resolve(Math.min(i, tr.doc.content.size));
                        if (r.parent.isTextblock) {
                            posForSelection = r.pos;
                            break;
                        }
                    }
                    // If forward search didn't change posForSelection, search backward
                    if (posForSelection === safePos) {
                        for (let i = safePos - 1; i >= 0; i--) {
                            const r = tr.doc.resolve(i);
                            if (r.parent.isTextblock) {
                                posForSelection = r.pos;
                                break;
                            }
                        }
                    }
                }

                tr = tr.setSelection(TextSelection.near(tr.doc.resolve(posForSelection)));
                dispatch(tr.scrollIntoView());
            }

            return true;
        }

        const tableDepth = this.findSharedTableDepth($from, $to);
        if (tableDepth > -1) {
            return this.wrapTableInLandscape(state, dispatch, type, tableDepth);
        }

        if (state.selection.empty) {
            return this.insertEmptyLandscapeSection(state, dispatch, type);
        }

        const range = $from.blockRange($to);
        if (!range) {
            return false;
        }

        return wrapIn(type)(state, dispatch);
    }

    private findLandscapeDepth(
        $from: ResolvedPos,
        type: NodeType
    ): number {
        for (let d = $from.depth; d > 0; d--) {
            if ($from.node(d).type === type) {
                return d;
            }
        }
        return -1;
    }

    private findSharedTableDepth(
        $from: ResolvedPos,
        $to: ResolvedPos
    ): number {
        for (let d = $from.depth; d > 0; d--) {
            const nodeType = $from.node(d).type;
            if (!this.isTableNode(nodeType)) {
                continue;
            }

            const tableStart = $from.before(d);
            const tableEnd = $from.after(d);
            if ($to.pos >= tableStart && $to.pos <= tableEnd) {
                return d;
            }
        }

        return -1;
    }

    private isTableNode(type: NodeType): boolean {
        return type.name === 'table' || type.spec.tableRole === 'table';
    }

    private wrapTableInLandscape(
        state: EditorState,
        dispatch: ((tr: Transaction) => void) | undefined,
        type: NodeType,
        tableDepth: number
    ): boolean {
        const { $from } = state.selection;
        const tableNode = $from.node(tableDepth);
        const parent = $from.node(tableDepth - 1);
        const index = $from.index(tableDepth - 1);

        if (!parent.canReplaceWith(index, index + 1, type)) {
            return false;
        }

        if (dispatch) {
            const tableStart = $from.before(tableDepth);
            const tableEnd = $from.after(tableDepth);
            const landscapeNode = type.create(null, tableNode.copy(tableNode.content));
            let tr = state.tr.replaceRangeWith(tableStart, tableEnd, landscapeNode);
            const mappedPos = tr.mapping.map($from.pos);
            const safePos = Math.min(Math.max(0, mappedPos), tr.doc.content.size);
            tr = tr.setSelection(TextSelection.near(tr.doc.resolve(safePos)));
            dispatch(tr.scrollIntoView());
        }

        return true;
    }

    private insertEmptyLandscapeSection(
        state: EditorState,
        dispatch: ((tr: Transaction) => void) | undefined,
        type: NodeType
    ): boolean {
        const paragraphType = state.schema.nodes.paragraph;
        if (!paragraphType) {
            return false;
        }

        const landscapeNode = type.create(
            null,
            paragraphType.createAndFill()
        );

        const { $from } = state.selection;
        let insertPos = -1;

        for (let d = $from.depth; d > 0; d--) {
            const parent = $from.node(d - 1);
            const index = $from.indexAfter(d - 1);
            if (parent.canReplaceWith(index, index, type)) {
                insertPos = $from.after(d);
                break;
            }
        }

        if (insertPos < 0) {
            return false;
        }

        if (dispatch) {
            let tr = state.tr.insert(insertPos, landscapeNode);
            const cursorPos = Math.min(insertPos + 2, tr.doc.content.size);
            tr = tr.setSelection(TextSelection.near(tr.doc.resolve(cursorPos)));
            dispatch(tr.scrollIntoView());
        }

        return true;
    }

    // Placeholder methods for UICommand compatibility
    cancel(): void {
        // No-op cancel; purposely returns void
        return;
    }
    executeCustom(
        _state: EditorState,
        tr: Transform,
        _from: number,
        _to: number
    ): Transform {
        return tr;
    }
    executeCustomStyleForTable(_state: EditorState, tr: Transform): Transform {
        return tr;
    }
}

export default LandscapeCommand;
