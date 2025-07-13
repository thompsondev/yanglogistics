# Global Footer Component

This directory contains the global footer component for the YangLogistics website.

## Files

- `footer.html` - The footer HTML template
- `footer.js` - JavaScript utility to load the footer dynamically
- `README.md` - This documentation file

## Usage

To use the global footer on any page:

1. **Add the footer container** before the closing `</body>` tag:
   ```html
   <!-- Global Footer Container -->
   <div id="global-footer"></div>
   ```

2. **Include the footer script** after your other scripts:
   ```html
   <script src="components/footer.js"></script>
   ```

## How it works

The `FooterLoader` class automatically:
- Loads the footer content from `footer.html`
- Handles errors gracefully with a fallback footer
- Initializes footer-specific functionality (smooth scrolling for anchor links)
- Auto-initializes when the DOM is loaded

## Benefits

- **Consistency**: All pages have the same footer
- **Maintainability**: Update the footer in one place
- **Performance**: Footer is loaded asynchronously
- **Reliability**: Fallback footer if external file fails to load

## Customization

To modify the footer:
1. Edit `footer.html` to change the content
2. Modify `footer.js` to add custom functionality
3. Update the fallback footer in `footer.js` if needed

## Example

```html
<!DOCTYPE html>
<html>
<head>
    <title>Your Page</title>
</head>
<body>
    <!-- Your page content -->
    
    <!-- Global Footer Container -->
    <div id="global-footer"></div>
    
    <!-- Scripts -->
    <script src="components/footer.js"></script>
</body>
</html>
``` 