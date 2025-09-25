
// LoadingSpinner.jsx
export default function LoadingSpinner({ size = 20 }) {
  return (
    <div
      className="animate-spin border-2 border-t-transparent border-white rounded-full"
      style={{ width: size, height: size }}
    />
  );
}
