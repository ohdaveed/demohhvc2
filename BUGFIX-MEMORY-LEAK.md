# Memory Leak Fix: Image Cleanup with useRef Pattern

## Problem

When uploading images in the InspectionForm component, object URLs were created using `URL.createObjectURL()` to display the images. These URLs need to be properly cleaned up to prevent memory leaks.

### Initial Implementation Issues

**BEFORE (Flawed Approach - PR #3):**

The cleanup useEffect had its dependency array changed from `[images]` to `[]`:

```javascript
useEffect(() => {
  return () => {
    images.forEach(img => {
      if (img.url) {
        URL.revokeObjectURL(img.url);
      }
    });
  };
}, []); // ❌ Cleanup closes over initial state
```

### Why This Didn't Work

The cleanup function created a closure over the initial `images` state (empty array). When the component unmounts, only the images present at the initial render would be revoked - any images added after the initial render would NOT be cleaned up, still causing memory leaks.

## Solution

Implement the useRef pattern to ensure the cleanup function always has access to the latest images state.

### Implementation

```javascript
// AFTER (Fixed Code)
// In the component body:
const imagesRef = useRef(images);
imagesRef.current = images;

// The effect for cleanup:
useEffect(() => {
  return () => {
    imagesRef.current.forEach(img => {
      if (img.url) {
        URL.revokeObjectURL(img.url);
      }
    });
  };
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, []); // ✅ Run cleanup only on unmount, accessing latest images via ref
```

### Why This Works

1. **Ref tracks latest state**: `imagesRef.current` is updated on every render with the latest `images` array
2. **Cleanup accesses current state**: The cleanup function uses `imagesRef.current`, ensuring it has access to all images, including those added after initial render
3. **Cleanup runs only on unmount**: The empty dependency array ensures the cleanup function only executes when the component is removed from the DOM
4. **Images remain visible**: Object URLs stay valid while the component is mounted
5. **Proper memory cleanup**: ALL URLs (including images added throughout the component lifecycle) are revoked when the component unmounts, preventing memory leaks
6. **Individual cleanup preserved**: The `removeImage` function already properly revokes URLs when individual images are deleted

## Testing

To verify the fix:

1. **Upload multiple images** during a single session
2. **Navigate away** from the component to trigger unmount
3. **Use Chrome DevTools Memory Profiler** to verify all blob URLs are released
4. **Confirm no regressions** in individual image removal functionality

## References

- Original PR: #3
- Gemini Code Assist review comment: https://github.com/ohdaveed/demohhvc2/pull/3#discussion_r2645634084
- React useRef documentation: https://react.dev/reference/react/useRef
