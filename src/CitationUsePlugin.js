// [FS] IRAD-1052 2020-10-30
// Plugin to handle custom style on load
import {Plugin, PluginKey} from 'prosemirror-state';
import CitationView from './ui/CitationView';

export default class CitationUsePlugin extends Plugin {
  constructor() {
    super({
      key: new PluginKey('CitationUsePlugin'),
      state: {
        init(config, state) {
          this.spec.props.nodeViews[
            'CitationView'
          ] =CitationView;
        },
        apply(tr, value, oldState, newState) {
        },
      },
      props: {       
        nodeViews: [CitationView],
      },      
    });
  }
}
 
