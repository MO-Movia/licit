/**
 * @license MIT
 * @copyright Copyright 2025 Modus Operandi Inc. All Rights Reserved.
 */

import React from 'react';

import canUseCSSFont from '../canUseCSSFont';
import {ThemeContext} from '@modusoperandi/licit-ui-commands';
// import { ReactComponent as UndoIcon } from '../../images/dark/undo.svg';

import '../styles/czi-icon.css';

import '../styles/icon-font.css';

const cached = {};

const CSS_FONT = 'Material Icons';

void (async function () {
  // NOSONAR
  // Inject CSS Fonts reuqired for toolbar icons.
  await canUseCSSFont(CSS_FONT);
})();

// const importImage = (filename) => import(`@assets/images/${filename}`);
/*class SuperscriptIcon extends React.PureComponent {
  render(): React.ReactElement {
    return (
      <span className="superscript-wrap">
        <span className="superscript-base">x</span>
        <span className="superscript-top">y</span>
      </span>
    );
  }
}*/

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
/*class SubscriptIcon extends React.PureComponent {
  render(): React.ReactElement {
    return (
      <span className="subscript-wrap">
        <span className="subscript-base">x</span>
        <span className="subscript-bottom">y</span>
      </span>
    );
  }
}*/

class Icon extends React.PureComponent {
  public static readonly contextType = ThemeContext;

  state = {
    image1: null,
  };

  // Get the static Icon.
  static get(
    type: string,
    title?: string,
    theme?: string
  ): React.CElement<React.ComponentProps<typeof Icon>, Icon> {
    const key = `${type || ''}-${title || ''}`;
    const icon = cached[key] || (
      <Icon theme={theme} title={title} type={type} />
    );
    cached[key] = icon;
    return icon as React.CElement<React.ComponentProps<typeof Icon>, Icon>;
  }

  declare props: {
    type: string;
    title?: string;
    theme?: string;
  };

  render(): React.ReactElement {
    const {type, title} = this.props;
    const {image1} = this.state;

    // const [image1, setImage] = useState(null);

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
    let _image = null;

    if (type.startsWith('assets/')) {
      _image = type;
    } else {
      let _fileName = 'Icon_Source';
      switch (type) {
        case 'format_align_right':
        case 'format_bold':
        case 'format_italic':
        case 'format_list_bulleted':
        case 'format_list_numbered':
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
        case 'format_line_spacing':
        case 'format_clear':
        case 'border_color':
        case 'settings_overscan':
        case 'icon_edit':
          _fileName = type;
          break;
        default:
          break;
      }
    }

    return (
      <img
        alt={title}
        src={image1}
        style={{width: '100%', height: '100%'}}
      ></img>
    );
    //return <span className={className}>{children}</span>;
  }

  componentDidMount() {
    const {type} = this.props;
    if (type.startsWith('assets/') || type.startsWith('data:image/svg+xml')) {
      // image1 = type;
      this.setState({image1: type});
    } else {
      let fileName = 'Icon_Source';
      switch (type) {
        case 'format_align_right':
        case 'format_bold':
        case 'format_italic':
        case 'format_list_bulleted':
        case 'format_list_numbered':
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
        case 'format_line_spacing':
        case 'format_strikethrough':
        case 'format_color_text':
        case 'format_clear':
        case 'border_color':
        case 'settings_overscan':
        case 'icon_edit':
        case 'more_horiz':
          fileName = type;
          break;
        default:
          break;
      }

      // const theme = this.context;
      const t = this.props.theme ? this.props.theme : 'dark';
      try {
        // Dynamically load the image
        //  const imageModule = await import(`@assets/images/${t}/${fileName}.svg`);
        //  const image1 = imageModule.default;
        const image1 = `assets/images/${t}/${fileName}.svg`;
        this.setState({image1});
      } catch (error) {
        console.error(`Error loading image: ${error}`);
      }
    }

    // async  loadImage(t: string, fileName: string) {
    //   try {
    //     const imageModule = await import(`./images/${t}/${fileName}`);
    //     const image = imageModule.default;
    //     return image;
    //   } catch (error) {
    //     console.error(`Error loading image: ${error}`);
    //     return null;
    //   }
    // }

    // async loadImage(t: string, fileName: string) {
    //   const imagePath = `./images/${t}/${fileName}`;
    //   // const image = require(imagePath) as string;
    //   const image = await importImage(`${t}/${fileName}`);
    //   // return imagePath;
    //   return image;
    // }

    // const loadIcons = async () => {
    //   // const loaded = {};
    //   // for (const key of Object.keys(icons)) {
    //     const image = await importImage(icons[key]);
    //     // loaded[key] = image.default; // Assuming default export from image file
    //   }
    // };
  }
}

export default Icon;
