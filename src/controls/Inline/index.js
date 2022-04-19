import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { getSelectionInlineStyle } from 'draftjs-utils';
import { RichUtils, EditorState, Modifier, SelectionState } from 'draft-js';
import { forEach } from '../../utils/common';

import LayoutComponent from './Component';

export default class Inline extends Component {
  static propTypes = {
    onChange: PropTypes.func.isRequired,
    editorState: PropTypes.object.isRequired,
    modalHandler: PropTypes.object,
    config: PropTypes.object,
    translations: PropTypes.object,
  };

  constructor(props) {
    super(props);
    const { editorState, modalHandler } = this.props;
    this.state = {
      currentStyles: editorState
        ? this.changeKeys(getSelectionInlineStyle(editorState))
        : {},
    };
    modalHandler.registerCallBack(this.expandCollapse);
  }

  componentDidUpdate(prevProps) {
    const { editorState } = this.props;
    if (editorState && editorState !== prevProps.editorState) {
      this.setState({
        currentStyles: this.changeKeys(getSelectionInlineStyle(editorState)),
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

  getStateEntry = (name, state) => state._map._root.entries.find(E => E[0] === name)[1]

  toggleInlineStyle = style => {
    const newStyle = style === 'monospace' ? 'CODE' : style.toUpperCase();
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

    newState = RichUtils.toggleInlineStyle(newState, newStyle);
    if (style === 'subscript' || style === 'superscript') {
      const removeStyle = style === 'subscript' ? 'SUPERSCRIPT' : 'SUBSCRIPT';
      const contentState = Modifier.removeInlineStyle(
        newState.getCurrentContent(),
        newState.getSelection(),
        removeStyle
      );
      newState = EditorState.push(
        newState,
        contentState,
        'change-inline-style'
      );
    }
    if (oldSelection !== selection) {
      newState = EditorState.set(newState, { selection: oldSelection });
    }
    if (newState) {
      onChange(newState);
    }
  };

  changeKeys = style => {
    if (style) {
      const st = {};
      forEach(style, (key, value) => {
        st[key === 'CODE' ? 'monospace' : key.toLowerCase()] = value;
      });
      return st;
    }
    return undefined;
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

  render() {
    const { config, translations } = this.props;
    const { expanded, currentStyles } = this.state;
    const InlineComponent = config.component || LayoutComponent;
    return (
      <InlineComponent
        config={config}
        translations={translations}
        currentState={currentStyles}
        expanded={expanded}
        onExpandEvent={this.onExpandEvent}
        doExpand={this.doExpand}
        doCollapse={this.doCollapse}
        onChange={this.toggleInlineStyle}
      />
    );
  }
}
// make subscript less low
