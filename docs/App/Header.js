// @flow
// @jsx glam

import glam from 'glam';
import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';

import Select from '../../src';
import type { RouterProps } from '../types';
import GitHubButton from './GitHubButton';

const smallDevice = '@media (max-width: 769px)';
const largeDevice = '@media (min-width: 770px)';

const changes = [
  {
    value: '/api',
    icon: '🤖',
    label: 'Simpler and more extensible',
  },
  {
    value: '/styles',
    icon: '🎨',
    label: 'CSS-in-JS styling API',
  },
  {
    value: '/components',
    icon: '🏗',
    label: 'Replacable component architecture',
  },
  // {
  //   value: '/home#animated-components',
  //   icon: '🚀',
  //   label: 'Animation built in',
  // },
];

function getLabel({ icon, label }) {
  return (
    <div style={{ alignItems: 'center', display: 'flex ' }}>
      <span style={{ fontSize: 18, marginRight: '0.5em' }}>{icon}</span>
      <span style={{ fontSize: 14 }}>{label}</span>
    </div>
  );
}

const Gradient = ({ css, innerRef, style, ...props }) => (
  <div
    css={{
      backgroundColor: '#2684FF',
      color: 'white',
      position: 'relative',
      zIndex: 2,

      [largeDevice]: {
        boxShadow: '0 5px 0 rgba(0, 0, 0, 0.08)',
      },
      ...css,
    }}
    ref={innerRef}
    style={{
      backgroundImage: 'linear-gradient(135deg, #2684FF 0%, #0747A6 100%)',
      ...style,
    }}
    {...props}
  />
);
const Container = props => (
  <div
    css={{
      boxSizing: 'border-box',
      maxWidth: 800,
      marginLeft: 'auto',
      marginRight: 'auto',
      padding: 20,

      [largeDevice]: {
        paddingBottom: 40,
        paddingTop: 40,
      },
    }}
    {...props}
  />
);

type HeaderProps = RouterProps & { children: any };
type HeaderState = {
  contentHeight: 'auto' | number,
  isTransitioning: boolean,
  stars: number,
};

const apiUrl = 'https://api.github.com/repos/jedwatson/react-select';

class Header extends Component<HeaderProps, HeaderState> {
  content: HTMLElement;
  state = { contentHeight: 'auto', isTransitioning: false, stars: 0 };
  componentDidMount() {
    if (this.content) {
      this.content.addEventListener('transitionend', this.transitionEnd);
    }
    this.getStarCount();
  }
  componentWillReceiveProps({ location }: HeaderProps) {
    const valid = ['/', '/home'];
    const shouldCollapse = !valid.includes(this.props.location.pathname);
    if (location.pathname !== this.props.location.pathname && shouldCollapse) {
      this.toggleCollapse();
    }
  }
  componentWillUnmount() {
    if (this.content) {
      this.content.removeEventListener('transitionend', this.transitionEnd);
    }
  }
  transitionEnd = () => {
    this.setState({ isTransitioning: false });
  };
  getStarCount = () => {
    // $FlowFixMe: escape global `CLIENT_ID` & `CLIENT_SECRET`
    const fetchUrl = `${apiUrl}?client_id=${
      process.env.CLIENT_ID
    }&client_secret=${process.env.CLIENT_SECRET}`;
    fetch(fetchUrl)
      .then(res => res.json())
      .then(data => {
        const stars = data.stargazers_count;
        this.setState({ stars });
      })
      .catch(err => {
        console.error('Error retrieving data', err);
      });
  };
  isHome = (props = this.props) => {
    const valid = ['/', '/home'];
    return valid.includes(props.location.pathname);
  };
  toggleCollapse = () => {
    this.setState({
      contentHeight: this.content.scrollHeight,
      isTransitioning: true,
    });
  };
  getContent = ref => {
    if (!ref) return;
    this.content = ref;
    this.setState({ contentHeight: ref.scrollHeight });
  };
  render() {
    const { children, history } = this.props;
    const { contentHeight, isTransitioning, stars } = this.state;

    return (
      <Gradient>
        <Collapse
          isCollapsed={!this.isHome()}
          isTransitioning={isTransitioning}
          height={contentHeight}
          innerRef={this.getContent}
        >
          <Container>
            <h1
              css={{
                fontSize: '2.4em',
                fontWeight: 'bold',
                lineHeight: 1,
                margin: 0,
                marginTop: '-0.2em',
                textShadow: '1px 1px 0 rgba(0, 82, 204, 0.33)',
                color: 'inherit',

                [largeDevice]: {
                  fontSize: '3.6em',
                },
              }}
            >
              React Select
              <small
                css={{
                  color: '#B2D4FF',
                  fontSize: '0.5em',
                  position: 'relative',
                  marginLeft: '0.25em',
                }}
              >
                v2
              </small>
            </h1>
            <Content
              stars={stars}
              onChange={opt => {
                history.push(opt.value);
              }}
            />
          </Container>
        </Collapse>
        {children}
      </Gradient>
    );
  }
}
const Collapse = ({
  height,
  isCollapsed,
  isTransitioning,
  innerRef,
  ...props
}) => {
  const duration = isCollapsed ? 260 : 340;
  return (
    <div
      ref={innerRef}
      css={{
        height: isCollapsed ? 0 : height,
        overflow: isCollapsed || isTransitioning ? 'hidden' : null,
        transition: `height ${duration}ms cubic-bezier(0.2, 0, 0, 1)`,
        transform: 'translateZ(0)',
      }}
      {...props}
    />
  );
};
const Content = ({ onChange, stars }) => (
  <div
    css={{
      marginTop: 16,

      [largeDevice]: { display: 'flex ' },
    }}
  >
    <div css={{ flex: 1, [largeDevice]: { paddingRight: 30 } }}>
      <p
        style={{
          fontSize: '1.25em',
          lineHeight: 1.4,
          marginTop: -5,
        }}
      >
        A flexible and beautiful Select Input control for ReactJS with
        multiselect, autocomplete, async and creatable support.
      </p>
      <GitHubButton
        count={stars}
        repo="https://github.com/jedwatson/react-select"
      />
    </div>
    <div
      css={{
        color: 'black',
        flex: '0 1 320px',
        [smallDevice]: {
          paddingTop: 30,
        },
      }}
    >
      <div className="animate-dropin">
        <Select
          getOptionLabel={getLabel}
          isSearchable={false}
          options={changes}
          onChange={onChange}
          placeholder="🎉 What's new in V2"
          value={[]}
          styles={{
            control: (css, { isFocused }) => ({
              ...css,
              backgroundClip: 'padding-box',
              borderColor: 'rgba(0,0,0,0.1)',
              boxShadow: isFocused ? '0 0 0 1px #4C9AFF' : null,

              ':hover': {
                borderColor: 'rgba(0,0,0,0.2)',
              },
            }),
            option: css => ({
              ...css,
              padding: '4px 12px',
            }),
            placeholder: css => ({
              ...css,
              color: 'black',
              position: 'static', // FF layout fix; this select never receives a value
            }),
          }}
        />
      </div>
    </div>
  </div>
);

export default withRouter(Header);
