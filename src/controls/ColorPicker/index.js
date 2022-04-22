import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  toggleCustomInlineStyle,
  getSelectionCustomInlineStyle,
} from 'draftjs-utils';
import { EditorState, SelectionState } from 'draft-js';

import LayoutComponent from './Component';

class ColorPicker extends Component {
  static propTypes = {
    onChange: PropTypes.func.isRequired,
    editorState: PropTypes.object.isRequired,
    editorFocused: PropTypes.bool,
    modalHandler: PropTypes.object,
    config: PropTypes.object,
    translations: PropTypes.object,
  };

  state = {
    expanded: false,
    currentColor: undefined,
    currentBgColor: undefined,
  };

  constructor(props) {
    super(props);
    const { editorState, modalHandler } = props;
    const state = {
      expanded: false,
      currentColor: undefined,
      currentBgColor: undefined,
    };
    if (editorState) {
      state.currentColor = getSelectionCustomInlineStyle(editorState, [
        'COLOR',
      ]).COLOR;
      state.currentBgColor = getSelectionCustomInlineStyle(editorState, [
        'BGCOLOR',
      ]).BGCOLOR;
    }
    this.state = state;
    modalHandler.registerCallBack(this.expandCollapse);
  }

  componentDidUpdate(prevProps) {
    const { editorState } = this.props;
    if (editorState && editorState !== prevProps.editorState) {
      this.setState({
        currentColor: getSelectionCustomInlineStyle(editorState, ['COLOR'])
          .COLOR,
        currentBgColor: getSelectionCustomInlineStyle(editorState, ['BGCOLOR'])
          .BGCOLOR,
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

  toggleColor = (style, color) => {
    const { editorState, onChange } = this.props;
    let selection = editorState.getSelection();
    let newState = editorState;
    let oldSelection = selection;
    if (selection.getAnchorOffset() == selection.getFocusOffset() || !this.props.editorFocused) {
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
    newState = toggleCustomInlineStyle(newState, style, color);
    if (newState) {
      onChange(newState);
    }
    if (oldSelection !== selection) {
      newState = EditorState.set(newState, { selection: oldSelection });
    }
    this.doCollapse();
  };

  render() {
    const { config, translations } = this.props;
    const { currentColor, currentBgColor, expanded } = this.state;
    const ColorPickerComponent = config.component || LayoutComponent;
    const color = currentColor && currentColor.substring(6);
    const bgColor = currentBgColor && currentBgColor.substring(8);
    return (
      <ColorPickerComponent
        config={config}
        translations={translations}
        onChange={this.toggleColor}
        expanded={expanded}
        onExpandEvent={this.onExpandEvent}
        doExpand={this.doExpand}
        doCollapse={this.doCollapse}
        currentState={{ color, bgColor }}
      />
    );
  }
}

export default ColorPicker;
