const BackgroundPattern = () => {
  return (
    <div
      className="fixed inset-0 -z-50"
      style={{
        background: 'linear-gradient(to bottom, #000000, #1a1a1a, #333333, #1a1a1a, #000000)',
      }}
    />
  );
};

BackgroundPattern.displayName = 'BackgroundPattern';

export { BackgroundPattern };
