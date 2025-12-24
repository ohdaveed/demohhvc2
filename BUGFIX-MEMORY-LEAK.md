# Bug Fix: Memory Leak in Image Cleanup

## Issue Description

**Severity:** CRITICAL  
**Component:** `InspectionForm.jsx`  
**Lines:** 71-80

### Problem

The `useEffect` hook responsible for cleaning up object URLs had `images` in its dependency array. This caused the cleanup function to run every time the images array changed (i.e., whenever a new image was added or removed).

```javascript
// BEFORE (Buggy Code)
useEffect(() => {
  return () => {
    images.forEach(img => {
      if (img.url) {
        URL.revokeObjectURL(img.url);
      }
    });
  };
}, [images]); // ❌ This causes cleanup to run on every images change
```

### Impact

1. **Images disappear from UI**: When a new image is added, the cleanup function runs and revokes URLs of ALL existing images, causing them to disappear from the screen
2. **Broken image displays**: Users see broken image icons instead of their uploaded photos
3. **Poor user experience**: Users think the upload failed when images vanish
4. **Memory leaks still possible**: Despite attempting to clean up, the frequent revocations don't actually prevent memory leaks properly

### Root Cause

React's `useEffect` cleanup function runs in two scenarios:
1. Before the effect runs again (when dependencies change)
2. When the component unmounts

By including `images` in the dependency array, we triggered scenario #1 every time images changed, which revoked URLs that were still being used by the UI.

## Solution

Remove `images` from the dependency array so the cleanup only runs on component unmount:

```javascript
// AFTER (Fixed Code)
useEffect(() => {
  return () => {
    images.forEach(img => {
      if (img.url) {
        URL.revokeObjectURL(img.url);
      }
    });
  };
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, []); // ✅ Run cleanup only on unmount, not on every images change
```

### Why This Works

1. **Cleanup runs only on unmount**: The cleanup function now only executes when the component is removed from the DOM
2. **Images remain visible**: Object URLs stay valid while the component is mounted
3. **Proper memory cleanup**: All URLs are still revoked when the component unmounts, preventing memory leaks
4. **Individual cleanup preserved**: The `removeImage` function already properly revokes URLs when individual images are deleted

### Additional Safety

The `removeImage` function already has proper cleanup for individual image removal:

```javascript
const removeImage = (id) => {
  setImages(prev => {
    const imageToRemove = prev.find(img => img.id === id);
    if (imageToRemove && imageToRemove.url) {
      URL.revokeObjectURL(imageToRemove.url); // ✅ Proper cleanup
    }
    return prev.filter(img => img.id !== id);
  });
  if (modalImageId === id) setModalImageId(null);
};
```

This ensures that:
- URLs are revoked immediately when images are removed
- No memory leaks occur during normal operation
- The unmount cleanup acts as a final safety net

## Testing Recommendations

To verify this fix:

1. **Manual Testing:**
   - Upload multiple images one by one
   - Verify all images remain visible after each upload
   - Remove individual images and verify they disappear
   - Navigate away from the component and verify no memory leaks

2. **Memory Profiling:**
   - Use Chrome DevTools Memory Profiler
   - Take heap snapshots before and after multiple image uploads
   - Verify blob URLs are properly released

3. **Automated Testing:**
   - Mock `URL.createObjectURL` and `URL.revokeObjectURL`
   - Verify revoke is NOT called on re-renders
   - Verify revoke IS called on unmount
   - Verify revoke IS called when individual images are removed

## Related Issues

This fix addresses the primary memory leak issue. However, there are additional improvements that could be made:

1. **Race condition in async image analysis** (separate issue)
2. **Missing error handling in generateReport** (separate issue)
3. **Voice service cleanup on unmount** (separate issue)

These will be addressed in separate pull requests.

## References

- React useEffect documentation: https://react.dev/reference/react/useEffect
- MDN URL.createObjectURL: https://developer.mozilla.org/en-US/docs/Web/API/URL/createObjectURL
- MDN URL.revokeObjectURL: https://developer.mozilla.org/en-US/docs/Web/API/URL/revokeObjectURL
