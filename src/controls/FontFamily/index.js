import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  toggleCustomInlineStyle,
  getSelectionCustomInlineStyle,
} from 'draftjs-utils';
import { EditorState, SelectionState } from 'draft-js';

import LayoutComponent from './Component';

export default class FontFamily extends Component {
  static propTypes = {
    onChange: PropTypes.func.isRequired,
    editorState: PropTypes.object,
    modalHandler: PropTypes.object,
    config: PropTypes.object,
    translations: PropTypes.object,
  };

  constructor(props) {
    super(props);
    const { editorState, modalHandler } = props;
    this.state = {
      expanded: undefined,
      currentFontFamily: editorState
        ? getSelectionCustomInlineStyle(editorState, ['FONTFAMILY']).FONTFAMILY
        : undefined,
    };
    modalHandler.registerCallBack(this.expandCollapse);
  }

  componentDidUpdate(prevProps) {
    const { editorState } = this.props;
    if (editorState && editorState !== prevProps.editorState) {
      this.setState({
        currentFontFamily: getSelectionCustomInlineStyle(editorState, [
          'FONTFAMILY',
        ]).FONTFAMILY,
      });
    }
  }

  componentWillUnmount() {
    const { modalHandler } = this.props;
    modalHandler.deregisterCallBack(this.expandCollapse);
  }

  onExpandEvent = () => {
    this.signalExpanded = !this.state.expanded;
  };

  expandCollapse = () => {
    this.setState({
      expanded: this.signalExpanded,
    });
    this.signalExpanded = false;
  };

  doExpand = () => {
    this.setState({
      expanded: true,
    });
  };

  doCollapse = () => {
    this.setState({
      expanded: false,
    });
  };

  toggleFontFamily = fontFamily => {
    const { editorState, onChange } = this.props;
    let selection = editorState.getSelection();
    let newState = editorState;
    let oldSelection = selection;
    if (selection.getAnchorOffset() == selection.getFocusOffset()) {
      const currentContent = editorState.getCurrentContent();
      const firstBlock = currentContent.getBlockMap().first();
      const lastBlock = currentContent.getBlockMap().last();
      const firstBlockKey = firstBlock.getKey();
      const lastBlockKey = lastBlock.getKey();
      const lengthOfLastBlock = lastBlock.getLength();

      selection = new SelectionState({
        anchorKey: firstBlockKey,
        anchorOffset: 0,
        focusKey: lastBlockKey,
        focusOffset: lengthOfLastBlock,
      });

      newState = EditorState.set(newState, { selection });
    }
    newState = toggleCustomInlineStyle(
      newState,
      'fontFamily',
      fontFamily
    );
    if (oldSelection !== selection) {
      newState = EditorState.set(newState, { selection: oldSelection });
    }
    if (newState) {
      onChange(newState);
    }
  };

  render() {
    const { config, translations } = this.props;
    const { expanded, currentFontFamily } = this.state;
    const FontFamilyComponent = config.component || LayoutComponent;
    const fontFamily = currentFontFamily && currentFontFamily.substring(11);
    return (
      <FontFamilyComponent
        translations={translations}
        config={config}
        currentState={{ fontFamily }}
        onChange={this.toggleFontFamily}
        expanded={expanded}
        onExpandEvent={this.onExpandEvent}
        doExpand={this.doExpand}
        doCollapse={this.doCollapse}
      />
    );
  }
}
