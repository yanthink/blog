import { get } from 'lodash';

const inlineAttachment = function inlineAttachment(options, instance) {
  this.settings = { ...inlineAttachment.defaults, ...options };
  this.editor = instance;
  this.filenameTag = '{filename}';
  this.lastValue = null;
};

/**
 * Will holds the available editors
 *
 * @type {Object}
 */
inlineAttachment.editors = {};

/**
 * Utility functions
 */
inlineAttachment.util = {
  /**
   * Append a line of text at the bottom, ensuring there aren't unnecessary newlines
   *
   * @param {String} previous Value which should be appended after the current content
   * @param {String} appended Current content
   */
  appendInItsOwnLine(previous, appended) {
    return `${previous}\n\n[[D]]${appended}`
      .replace(/(\n{2,})\[\[D\]\]/, '\n\n')
      .replace(/^(\n*)/, '');
  },

  /**
   * Inserts the given value at the current cursor position of the textarea element
   *
   * @param  {Element} el
   * @param  {String} text Text which will be inserted at the cursor position
   */
  insertTextAtCursor(el, text) {
    const scrollPos = el.scrollTop;
    let strPos = 0;
    let browser = false;
    let range;

    if (el.selectionStart || el.selectionStart === '0') {
      browser = 'ff';
    } else if (document.selection) {
      browser = 'ie';
    }

    if (browser === 'ie') {
      el.focus();
      range = document.selection.createRange();
      range.moveStart('character', -el.value.length);
      strPos = range.text.length;
    } else if (browser === 'ff') {
      strPos = el.selectionStart;
    }

    const front = el.value.substring(0, strPos);
    const back = el.value.substring(strPos, el.value.length);
    el.value = front + text + back; // eslint-disable-line
    strPos += text.length;
    if (browser === 'ie') {
      el.focus();
      range = document.selection.createRange();
      range.moveStart('character', -el.value.length);
      range.moveStart('character', strPos);
      range.moveEnd('character', 0);
      range.select();
    } else if (browser === 'ff') {
      el.selectionStart = strPos; // eslint-disable-line
      el.selectionEnd = strPos; // eslint-disable-line
      el.focus();
    }
    el.scrollTop = scrollPos; // eslint-disable-line
  },
};

/**
 * Default configuration options
 *
 * @type {Object}
 */
inlineAttachment.defaults = {
  /**
   * URL where the file will be send
   */
  uploadUrl: 'upload_attachment.php',

  /**
   * Which method will be used to send the file to the upload URL
   */
  uploadMethod: 'POST',

  /**
   * Name in which the file will be placed
   */
  uploadFieldName: 'file',

  /**
   * Extension which will be used when a file extension could not
   * be detected
   */
  defaultExtension: 'png',

  /**
   * JSON field which refers to the uploaded file URL
   */
  jsonFieldName: 'filename',

  /**
   * Allowed MIME types
   */
  allowedTypes: ['image/jpeg', 'image/png', 'image/jpg', 'image/gif'],

  /**
   * Text which will be inserted when dropping or pasting a file.
   * Acts as a placeholder which will be replaced when the file is done with uploading
   */
  progressText: '![Uploading file...]()',

  /**
   * When a file has successfully been uploaded the progressText
   * will be replaced by the urlText, the {filename} tag will be replaced
   * by the filename that has been returned by the server
   */
  urlText: '![file]({filename})',

  /**
   * Text which will be used when uploading has failed
   */
  errorText: 'Error uploading file',

  /**
   * Extra parameters which will be send when uploading a file
   */
  extraParams: {},

  /**
   * Extra headers which will be send when uploading a file
   */
  extraHeaders: {},

  /**
   * Before the file is send
   */
  beforeFileUpload() {
    return true;
  },

  /**
   * Triggers when a file is dropped or pasted
   */
  onFileReceived() {},

  /**
   * Custom upload handler
   *
   * @return {Boolean} when false is returned it will prevent default upload behavior
   */
  onFileUploadResponse() {
    return true;
  },

  /**
   * Custom error handler. Runs after removing the placeholder text and before the alert().
   * Return false from this function to prevent the alert dialog.
   *
   * @return {Boolean} when false is returned it will prevent default error behavior
   */
  onFileUploadError() {
    return true;
  },

  /**
   * When a file has succesfully been uploaded
   */
  onFileUploaded() {},
};

/**
 * Uploads the blob
 *
 * @param  {Blob} file blob data received from event.dataTransfer object
 * @return {XMLHttpRequest} request object which sends the file
 */
inlineAttachment.prototype.uploadFile = function uploadFile(file) {
  const formData = new FormData();
  const xhr = new XMLHttpRequest();
  const { settings } = this;
  let extension = settings.defaultExtension || settings.defualtExtension;

  if (typeof settings.setupFormData === 'function') {
    settings.setupFormData(formData, file);
  }

  // Attach the file. If coming from clipboard, add a default filename (only works in Chrome for now)
  // http://stackoverflow.com/questions/6664967/how-to-give-a-blob-uploaded-as-formdata-a-file-name
  if (file.name) {
    const fileNameMatches = file.name.match(/\.(.+)$/);
    if (fileNameMatches) {
      extension = fileNameMatches[1]; // eslint-disable-line
    }
  }

  let remoteFilename = `image-${Date.now()}.${extension}`;
  if (typeof settings.remoteFilename === 'function') {
    remoteFilename = settings.remoteFilename(file);
  }

  formData.append(settings.uploadFieldName, file, remoteFilename);

  // Append the extra parameters to the formdata
  if (typeof settings.extraParams === 'object') {
    for (const key of Object.keys(settings.extraParams)) {
      formData.append(key, settings.extraParams[key]);
    }
  }

  xhr.open('POST', settings.uploadUrl);

  // Add any available extra headers
  if (typeof settings.extraHeaders === 'object') {
    for (const header of Object.keys(settings.extraHeaders)) {
      xhr.setRequestHeader(header, settings.extraHeaders[header]);
    }
  }

  xhr.onload = () => {
    // If HTTP status is OK or Created
    if (xhr.status === 200 || xhr.status === 201) {
      this.onFileUploadResponse(xhr);
    } else {
      this.onFileUploadError(xhr);
    }
  };

  if (settings.beforeFileUpload(xhr) !== false) {
    xhr.send(formData);
  }
  return xhr;
};

/**
 * Returns if the given file is allowed to handle
 *
 * @param {File} clipboard data file
 */
inlineAttachment.prototype.isFileAllowed = function isFileAllowed(file) {
  if (file.kind === 'string') {
    return false;
  }
  if (this.settings.allowedTypes.indexOf('*') === 0) {
    return true;
  }

  return this.settings.allowedTypes.indexOf(file.type) >= 0;
};

/**
 * Handles upload response
 *
 * @param  {XMLHttpRequest} xhr
 * @return {Void}
 */
inlineAttachment.prototype.onFileUploadResponse = function onFileUploadResponse(xhr) {
  if (this.settings.onFileUploadResponse.call(this, xhr) !== false) {
    const result = JSON.parse(xhr.responseText);
    const filename = get(result, this.settings.jsonFieldName);

    if (result && filename) {
      let newValue;
      if (typeof this.settings.urlText === 'function') {
        newValue = this.settings.urlText.call(this, filename, result);
      } else {
        newValue = this.settings.urlText.replace(this.filenameTag, filename);
      }
      const text = this.editor.getValue().replace(this.lastValue, newValue);
      this.editor.setValue(text);
      this.settings.onFileUploaded.call(this, filename);
    }
  }
};

/**
 * Called when a file has failed to upload
 *
 * @param  {XMLHttpRequest} xhr
 * @return {Void}
 */
inlineAttachment.prototype.onFileUploadError = function onFileUploadError(xhr) {
  if (this.settings.onFileUploadError.call(this, xhr) !== false) {
    const text = this.editor.getValue().replace(this.lastValue, '');
    this.editor.setValue(text);
  }
};

/**
 * Called when a file has been inserted, either by drop or paste
 *
 * @param  {File} file
 * @return {Void}
 */
inlineAttachment.prototype.onFileInserted = function onFileInserted(file) {
  if (this.settings.onFileReceived.call(this, file) !== false) {
    this.lastValue = this.settings.progressText;
    this.editor.insertValue(this.lastValue);
  }
};

/**
 * Called when a paste event occured
 * @param  {Event} e
 * @return {Boolean} if the event was handled
 */
inlineAttachment.prototype.onPaste = function onPaste(e) {
  let result = false;
  const { clipboardData } = e;
  let items;

  if (typeof clipboardData === 'object') {
    items = clipboardData.items || clipboardData.files || [];

    for (let i = 0; i < items.length; i += 1) {
      const item = items[i];
      if (this.isFileAllowed(item)) {
        result = true;
        this.onFileInserted(item.getAsFile());
        this.uploadFile(item.getAsFile());
      }
    }
  }

  if (result) {
    e.preventDefault();
  }

  return result;
};

/**
 * Called when a drop event occures
 * @param  {Event} e
 * @return {Boolean} if the event was handled
 */
inlineAttachment.prototype.onDrop = function onDrop(e) {
  let result = false;

  for (let i = 0; i < e.dataTransfer.files.length; i += 1) {
    const file = e.dataTransfer.files[i];
    if (this.isFileAllowed(file)) {
      result = true;
      this.onFileInserted(file);
      this.uploadFile(file);
    }
  }

  return result;
};

const codeMirrorEditor = function codeMirrorEditor(instance) {
  if (!instance.getWrapperElement) {
    throw new Error('Invalid CodeMirror object given');
  }

  this.codeMirror = instance;
};

codeMirrorEditor.prototype.getValue = function getValue() {
  return this.codeMirror.getValue();
};

codeMirrorEditor.prototype.insertValue = function insertValue(val) {
  this.codeMirror.replaceSelection(val);
};

codeMirrorEditor.prototype.setValue = function setValue(val) {
  const cursor = this.codeMirror.getCursor();
  this.codeMirror.setValue(val);
  this.codeMirror.setCursor(cursor);
};

/**
 * Attach InlineAttachment to CodeMirror
 *
 * @param {CodeMirror} codeMirror
 * @param {Object} options
 */
codeMirrorEditor.attach = function editorAttach(codeMirror, options = {}) {
  const editor = new codeMirrorEditor(codeMirror); // eslint-disable-line
  const inlineattach = new inlineAttachment(options, editor); // eslint-disable-line
  const el = codeMirror.getWrapperElement();

  el.addEventListener(
    'paste',
    e => {
      inlineattach.onPaste(e);
    },
    false
  );

  codeMirror.setOption('onDragEvent', (data, e) => {
    if (e.type === 'drop') {
      e.stopPropagation();
      e.preventDefault();
      return inlineattach.onDrop(e);
    }
  });
};

const codeMirrorEditor4 = function codeMirrorEditor4(instance) {
  codeMirrorEditor.call(this, instance);
};

codeMirrorEditor4.attach = function editor4Attach(codeMirror, options = {}) {
  const editor = new codeMirrorEditor(codeMirror); // eslint-disable-line
  const inlineattach = new inlineAttachment(options, editor); // eslint-disable-line
  const el = codeMirror.getWrapperElement();

  el.addEventListener(
    'paste',
    e => {
      inlineattach.onPaste(e);
    },
    false
  );

  codeMirror.on('drop', (data, e) => {
    if (inlineattach.onDrop(e)) {
      e.stopPropagation();
      e.preventDefault();
      return true;
    }
    return false;
  });
};

inlineAttachment.editors.codemirror = codeMirrorEditor;
inlineAttachment.editors.codemirror4 = codeMirrorEditor4;

export default inlineAttachment;
