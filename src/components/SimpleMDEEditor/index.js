import React, { PureComponent } from 'react';
import SimpleMDE from 'simplemde';
import inlineAttachment from './plugins/inlineAttachment';
import './simplemde.less';
import './markdown.less';
import './style.less';

export default class SimpleMDEEditor extends PureComponent {
  state = {
    keyChange: false,
  };

  componentWillMount() {
    this.id = this.props.id || `simplemde-editor-${Date.now()}`;
    this.wrapperId = `${this.id}-wrapper`;
  }

  componentDidMount() {
    if (typeof window !== 'undefined') {
      this.createEditor();
      this.addEvents();
      this.addExtraKeys();
      this.getCursor();
      this.getMdeInstance();
      if (this.props.uploadOptions) {
        inlineAttachment.editors.codemirror4.attach(
          this.simplemde.codemirror,
          this.props.uploadOptions
        );
      }
    }
  }

  componentWillReceiveProps(nextProps) {
    if (!this.state.keyChange && nextProps && nextProps.value !== this.simplemde.value()) {
      this.simplemde.value((nextProps && nextProps.value) || '');
    }

    this.setState({
      keyChange: false,
    });
  }

  componentWillUnmount() {
    this.removeEvents();
  }

  getCursor = () => {
    // https://codemirror.net/doc/manual.html#api_selection
    if (this.props.getLineAndCursor) {
      this.props.getLineAndCursor(this.simplemde.codemirror.getCursor());
    }
  };

  getMdeInstance = () => {
    if (this.props.getMdeInstance) {
      this.props.getMdeInstance(this.simplemde);
    }
  };

  createEditor = () => {
    const initialOptions = {
      element: document.getElementById(this.id),
      initialValue: this.props.value,
    };

    const allOptions = Object.assign({}, initialOptions, this.props.options);
    this.simplemde = new SimpleMDE(allOptions);

    if (allOptions.theme) {
      this.simplemde.codemirror.setOption('theme', allOptions.theme);
    }
  };

  eventWrapper = () => {
    this.setState({
      keyChange: true,
    });
    this.props.onChange(this.simplemde.value());
  };

  removeEvents = () => {
    this.editorEl.removeEventListener('keyup', this.eventWrapper);
    if (this.editorToolbarEl) {
      this.editorToolbarEl.removeEventListener('click', this.eventWrapper);
    }
  };

  addEvents = () => {
    const wrapperEl = document.getElementById(this.wrapperId);

    this.editorEl = wrapperEl.getElementsByClassName('CodeMirror')[0]; // eslint-disable-line
    this.editorToolbarEl = wrapperEl.getElementsByClassName('editor-toolbar')[0]; // eslint-disable-line

    this.editorEl.addEventListener('keyup', this.eventWrapper);
    if (this.editorToolbarEl) {
      this.editorToolbarEl.addEventListener('click', this.eventWrapper);
    }

    this.simplemde.codemirror.on('cursorActivity', this.getCursor);
  };

  addExtraKeys = () => {
    // https://codemirror.net/doc/manual.html#option_extraKeys
    if (this.props.extraKeys) {
      this.simplemde.codemirror.setOption('extraKeys', this.props.extraKeys);
    }
  };

  render() {
    return (
      <div id={this.wrapperId} className={this.props.className}>
        {this.props.label && <label htmlFor={this.id}> {this.props.label} </label>}
        <textarea id={this.id} />
      </div>
    );
  }
}
