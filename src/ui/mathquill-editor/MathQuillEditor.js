// @flow

import * as MathQuillEditorSymbols from './MathQuillEditorSymbols.js';
import MathQuillEditorSymbolsPanel from './MathQuillEditorSymbolsPanel.js';
import * as React from 'react';
import ReactDOM from 'react-dom';
import canUseCSSFont from './../canUseCSSFont.js';
import cx from 'classnames';

// [FS] IRAD-1061 2020-09-19
// Now loaded locally, so that it work in closed network as well.
import type { MathQuillEditorSymbol } from './MathQuillEditorSymbols.js';
import { MathQuill } from './mathquill-import-kludge.js';

const CSS_CDN_URL =
  '//cdnjs.cloudflare.com/ajax/libs/mathquill/0.10.1/mathquill.css';
const CSS_FONT = 'Symbola';

const MQ = MathQuill.getInterface(2);

(async function () {
  const fontSupported = await canUseCSSFont(CSS_FONT);
  if (!fontSupported) {
    console.info('Add CSS from ', CSS_CDN_URL);
    // [FS] IRAD-1061 2020-09-19
    // Now loaded locally, so that it work in closed network as well.
    //injectStyleSheet(CSS_CDN_URL);
  }
})();

class MathQuillElement extends React.Component<any, any> {
  shouldComponentUpdate(): boolean {
    return false;
  }

  render(): React.Element<any> {
    return (
      <div
        className="czi-mathquill-editor-element"
        dangerouslySetInnerHTML={{ __html: this.props.value }}
      />
    );
  }
}

class MathQuillEditor extends React.PureComponent<any, any> {
  props: {
    value: string,
    onChange?: ?(latex: string) => void,
  };

  // MathJax apparently fire 4 edit events on startup.
  _element = null;
  _ignoreEditEvents = 4;
  _mathField = null;
  _latex = '';

  render(): React.Element<any> {
    const { value } = this.props;
    const panels = [
      MathQuillEditorSymbols.OPERATORS,
      MathQuillEditorSymbols.STRUCTURE,
      MathQuillEditorSymbols.SYMBOLS,
      MathQuillEditorSymbols.TRIG,
    ].map(this._renderPanel);

    const empty = !value;
    const className = cx('czi-mathquill-editor', { empty });
    return (
      <div className={className}>
        <div className="czi-mathquill-editor-main">
          <MathQuillElement ref={this._onElementRef} />
        </div>
        <div className="czi-mathquill-editor-side">{panels}</div>
      </div>
    );
  }

  componentDidUpdate(): void {
    const mathField = this._mathField;
    if (this._latex !== this.props.value && mathField) {
      mathField.latex(this.props.value || ' ');
    }
  }

  componentDidMount(): void {
    const config = {
      autoCommands: 'pi theta sqrt sum',
      autoOperatorNames: 'sin cos',
      restrictMismatchedBrackets: true,
      handlers: {
        edit: this._onEdit,
      },
    };

    const mathField = MQ.MathField(this._element, config);
    this._mathField = mathField;

    // TODO: Remove this if MathQuill supports `\displaystyle`.
    const rawLatex = (this.props.value || '').replace(/\\displaystyle/g, '');

    mathField.latex(rawLatex || ' ');
    mathField.focus();
    if (rawLatex && !mathField.latex()) {
      console.error('unable to process latex', rawLatex);
    }
  }

  _renderPanel = (
    symbols: { title: string, symbols: Array<MathQuillEditorSymbol> },
    ii: number
  ): React.Element<any> => {
    return (
      <MathQuillEditorSymbolsPanel
        key={`s${ii}`}
        onSelect={this._onSymbolSelect}
        symbols={symbols}
      />
    );
  };

  _onSymbolSelect = (symbol: MathQuillEditorSymbol): void => {
    const { latex, cmd } = symbol;
    const mathField = this._mathField;
    if (!mathField || !cmd || !latex) {
      return;
    }
    if (cmd === 'write') {
      mathField.write(latex);
    } else if (cmd === 'cmd') {
      mathField.cmd(latex);
    }
    mathField.focus();
  };

  _onEdit = (mathField: any): void => {
    if (this._ignoreEditEvents > 0) {
      this._ignoreEditEvents -= 1;
      return;
    }

    const { onChange } = this.props;
    const latex = mathField.latex();
    this._latex = latex;
    onChange && onChange(latex);
  };

  _onElementRef = (ref: any): void => {
    if (ref) {
      this._element = ReactDOM.findDOMNode(ref);
    } else {
      this._element = null;
    }
  };
}

export default MathQuillEditor;
