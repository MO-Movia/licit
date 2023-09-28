// @flow

import cx from 'classnames';
import * as React from 'react';

import canUseCSSFont from './canUseCSSFont';
import { ThemeContext } from '@modusoperandi/licit-ui-commands';

import './czi-icon.css';

// [FS] IRAD-1061 2020-09-19
// Now loaded locally, so that it work in closed network as well.
//import injectStyleSheet from './injectStyleSheet';
import './icon-font.css';

//import ReactLogo from '../../images/Icon_de Indent1.svg';

const VALID_CHARS = /[a-z_]+/;
const cached = {};

const CSS_CDN_URL = '//fonts.googleapis.com/icon?family=Material+Icons';
const CSS_FONT = 'Material Icons';

(async function () {
  // Inject CSS Fonts reuqired for toolbar icons.
  const fontSupported = await canUseCSSFont(CSS_FONT);
  if (!fontSupported) {
    console.info('Add CSS from ', CSS_CDN_URL);
    // [FS] IRAD-1061 2020-09-19
    // Now loaded locally, so that it work in closed network as well.
    //injectStyleSheet(CSS_CDN_URL);
  }
})();

class SuperscriptIcon extends React.PureComponent<any, any> {
  render(): React.Element<any> {
    return (
      <span className="superscript-wrap">
        <span className="superscript-base">x</span>
        <span className="superscript-top">y</span>
      </span>
    );
  }
}

class SubscriptIcon extends React.PureComponent<any, any> {
  render(): React.Element<any> {
    return (
      <span className="subscript-wrap">
        <span className="subscript-base">x</span>
        <span className="subscript-bottom">y</span>
      </span>
    );
  }
}

/*function useDynamicSVGImport(name, options = {}) {
  const ImportedIconRef = useRef();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState();

  const { onCompleted, onError } = options;
  useEffect(() => {
    setLoading(true);
    const importIcon = async () => {
      try {
        ImportedIconRef.current = (
          await import(`./${name}.svg`)
        ).ReactComponent;
        if (onCompleted) {
          onCompleted(name, ImportedIconRef.current);
        }
      } catch (err) {
        if (onError) {
          onError(err);
        }
        setError(err);
      } finally {
        setLoading(false);
      }
    };
    importIcon();
  }, [name, onCompleted, onError]);

  return { error, loading, SvgIcon: ImportedIconRef.current };
}

function IconEx({name, onCompleted, onError, ...rest}) {
  const {error, loading, SvgIcon} = useDynamicSVGImport(name, {onCompleted, onError});
  if(error) {
    return error.message;
  }

  if(loading) {
    return "Loading...";
  }

  if(SvgIcon) {
    return <SvgIcon {...rest}/>
  }
}
*/

class Icon extends React.PureComponent<any, any> {
  static contextType = ThemeContext;
  // Get the static Icon.
  static get(type: string, title: ?string, theme: ?string): React.Element<any> {
    const key = `${type || ''}-${title || ''}`;
    const icon = cached[key] || <Icon title={title} type={type} theme={theme} />;
    cached[key] = icon;
    return icon;
  }

  props: {
    type: string,
    title: ?string,
  };

  render(): React.Element<any> {
    const { type, title, theme } = this.props;
    let className = '';
    let children = '';
    /*if (type == 'superscript') {
      className = cx('czi-icon', { [type]: true });
      children = <SuperscriptIcon />;
    } else if (type == 'subscript') {
      className = cx('czi-icon', { [type]: true });
      children = <SubscriptIcon />;
    } else if (!type || !VALID_CHARS.test(type)) {
      className = cx('czi-icon-unknown');
      children = title || type;
    } else {
      className = cx('czi-icon', { [type]: true });
      children = type;
    }*/
    let image = null;

    if (type.startsWith('http')) {
      image = type;
    } else {
      let fileName = 'Icon_Clear Formatting Buttons';
      switch (type) {
        case 'format_align_right':
        case 'format_bold':
        case 'format_italic':
        case 'format_list_bulleted':
        case 'format_underline':
        case 'functions':
        case 'grid_on':
        case 'hr':
        case 'link':
        case 'redo':
        case 'undo':
        case 'arrow_drop_down':
        case 'format_align_left':
          fileName = type;
          break;
        default:
          break;
      }

      const t = this.context ? this.context : theme;
      image = require('../../images/' + t + '/' + fileName + '.svg');
    }

    //const { srcImg } = await import(`${path}`);`${path}`;//[`../../images/${'format_align_justify'}.svg`]//'../../images/format_align_justify.svg'
    return (
      <img
        src={image}
        alt={title}
        style={{ width: '100%', height: '100%' }}
      ></img>
    );
    //return <span className={className}>{children}</span>;
  }
}

export default Icon;
