import cx from 'classnames';
import * as React from 'react';

import canUseCSSFont from '../canUseCSSFont';
import { ThemeContext } from '@modusoperandi/licit-ui-commands';
// import { ReactComponent as UndoIcon } from '../../images/dark/undo.svg';

import '../styles/czi-icon.css';

import '../styles/icon-font.css';

const VALID_CHARS = /[a-z_]+/;
const cached = {};

const CSS_FONT = 'Material Icons';

(async function () {
  // Inject CSS Fonts reuqired for toolbar icons.
  await canUseCSSFont(CSS_FONT);
})();

class SuperscriptIcon extends React.PureComponent {
  render(): React.ReactElement {
    return (
      <span className="superscript-wrap">
        <span className="superscript-base">x</span>
        <span className="superscript-top">y</span>
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
class SubscriptIcon extends React.PureComponent {
  render(): React.ReactElement {
    return (
      <span className="subscript-wrap">
        <span className="subscript-base">x</span>
        <span className="subscript-bottom">y</span>
      </span>
    );
  }
}

class Icon extends React.PureComponent {
  static contextType = ThemeContext;

   // Get the static Icon.
   static get(type: string, title?:string, theme?: string): React.CElement<any,any> {
    const key = `${type || ''}-${title || ''}`;
    const icon = cached[key] || <Icon theme={theme} title={title} type={type} />;
    cached[key] = icon;
    return icon;
  }


  props: {
    type: string;
    title?: string;
    theme?:string
  };

  render(): React.ReactElement {
    const { type, title } = this.props;
    const className = '';
    const children = '';
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
      let fileName = 'Icon_Source';
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
        case 'format_align_center':
        case 'format_align_justify':
        case 'superscript':
        case 'subscript':
        case 'format_indent_increase':
        case 'format_indent_decrease':
        case 'format_strikethrough':
        case 'format_color_text':
        case 'format_clear':
        case 'border_color':
        case 'settings_overscan':
          fileName = type;
          break;
        default:
          break;
      }

      // const theme = this.context;
      const t =  this.props.theme ? this.props.theme : 'dark';
      console.log('fromicon '+ t);
      // image = this.loadImage('dark',fileName+'.svg')
      image = this.loadImage(t,fileName+'.svg');
        // const dynamicPath = './';
      // image = require('../../images/' + t + '/' + fileName + '.svg');
      // import image from `../../images/${t}/${fileName}.svg`;
    }

    //const { srcImg } = await import(`${path}`);`${path}`;//[`../../images/${'format_align_justify'}.svg`]//'../../images/format_align_justify.svg'
    return (
      <img
        alt={title}
        src={image}
        style={{ width: '100%', height: '100%' }}
      ></img>

    );
    //return <span className={className}>{children}</span>;
  }

  loadImage(t: string, fileName: string): string {
    const imagePath = `../images/${t}/${fileName}`;
    // const image = require(imagePath) as string;
    return imagePath;
  }
}

export default Icon;
