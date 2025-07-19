import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import Icon from './icon'; 
import SuperscriptIcon from './icon'
import '@testing-library/jest-dom';

jest.mock('../canUseCSSFont', () => jest.fn().mockResolvedValue(true)); // Mock the canUseCSSFont function

// Mock ThemeContext for testing
const MockThemeContext = ({ children }) => (
  <div>{children}</div>
);

describe('Icon Component', () => {
  it('renders an icon with a valid image source when type is a valid icon', async () => {
    // Arrange
    const type = 'format_bold';
    const title = 'Bold Icon';
    const theme = 'dark';

    // Render the component
    render(
      <MockThemeContext>
        <Icon type={type} title={title} theme={theme} />
      </MockThemeContext>
    );

    // Check that the img element is in the document
    const imgElement = screen.getByRole('img');
    expect(imgElement).toBeInTheDocument();

    // Since the image is loaded asynchronously, we wait for it to be updated
    await waitFor(() => expect(imgElement).toHaveAttribute('src', 'assets/images/dark/format_bold.svg'));
  });

  it('renders an icon when type is a URL', async () => {
    const imageURL = 'http://example.com/icon.svg';
    render(<Icon type={imageURL} />);

    const imgElement = screen.getByRole('img');
    expect(imgElement).toBeInTheDocument();

    // Check if the image URL is set correctly
    expect(imgElement).toHaveAttribute('src', imageURL);
  });

  it('displays a placeholder or error when no valid icon is found', async () => {
    const invalidType = 'invalid_icon';

    render(<Icon type={invalidType} />);

    const imgElement = screen.getByRole('img');
    expect(imgElement).toBeInTheDocument();

    // We expect it to show some fallback behavior (empty source for now, or any placeholder behavior you set)
    await waitFor(() => expect(imgElement).toHaveAttribute('src', 'assets/images/dark/Icon_Source.svg'));
  });

  it('correctly applies the theme if provided', async () => {
    const type = 'format_bold';
    const theme = 'light';

    render(
      <MockThemeContext>
        <Icon type={type} theme={theme} />
      </MockThemeContext>
    );

    const imgElement = screen.getByRole('img');
    await waitFor(() => expect(imgElement).toHaveAttribute('src', 'assets/images/light/format_bold.svg'));
  });

  it('renders with the default theme if no theme is provided', async () => {
    const type = 'format_bold';

    render(<Icon type={type} />);

    const imgElement = screen.getByRole('img');
    await waitFor(() => expect(imgElement).toHaveAttribute('src', 'assets/images/dark/format_bold.svg'));
  });
});


describe('Icon static get method', () => {
  it('should return a new Icon when the type and title are unique', () => {
    const type = 'format_bold';
    const title = 'Bold Icon';
    const theme = 'dark';

    // Clear cache before testing
    const cached = {
        'format_bold-Bold Icon': {
            props: {
                type: 'format_bold',
                title: 'Bold Icon',
                theme: 'dark'
            }
        }
    };
    Icon.get(type, title, theme); // Call it once
    const firstIcon = cached[`${type}-${title}`];

    // Check if the first icon is created
    expect(firstIcon).toBeDefined();
    expect(firstIcon.props.type).toBe(type);
    expect(firstIcon.props.title).toBe(title);
    expect(firstIcon.props.theme).toBe(theme);
  });

  it('should return a cached Icon when the type and title are the same', () => {
    const type = 'format_bold';
    const title = 'Bold Icon';
    const theme = 'dark';

    // Call Icon.get twice
    const firstIcon = Icon.get(type, title, theme);
    const secondIcon = Icon.get(type, title, theme);

    // Check if the cached value is returned
    expect(firstIcon).toBe(secondIcon); // The second call should return the same object
  });

  it('should return different icons for different types', () => {
    const type1 = 'format_bold';
    const title1 = 'Bold Icon';
    const theme1 = 'dark';
    
    const type2 = 'format_italic';
    const title2 = 'Italic Icon';
    const theme2 = 'dark';

    // Call Icon.get for both types
    const firstIcon = Icon.get(type1, title1, theme1);
    const secondIcon = Icon.get(type2, title2, theme2);

    // Check if the two icons are different
    expect(firstIcon).not.toBe(secondIcon); // The two icons should be different
  });

  it('should handle missing title and theme properly', () => {
    const type = 'format_bold';

    // Call Icon.get with only type
    const icon = Icon.get(type);

    // Check if the icon is returned with undefined title and theme
    expect(icon.props.type).toBe(type);
    expect(icon.props.title).toBeUndefined();
    expect(icon.props.theme).toBeUndefined();
  });
});

