const MediaItem = ({ item, className }) =>
  item.type === "VIDEO" ? (
    <video src={item.url} controls preload="metadata" className={className} />
  ) : (
    <img src={item.url} alt="Post media" loading="lazy" className={className} />
  );

const MediaGrid = ({ media }) => {
  if (!media || media.length === 0) return null;

  // One item: show it large
  if (media.length === 1) {
    const item = media[0];
    return (
      <div className="mt-3 overflow-hidden rounded-2xl bg-gray-100">
        <MediaItem
          item={item}
          className={
            item.type === "VIDEO"
              ? "max-h-[36rem] w-full bg-black"
              : "max-h-[36rem] w-full object-cover"
          }
        />
      </div>
    );
  }

  // Two or more: 2-column grid. A lone last item spans the full width.
  return (
    <div className="mt-3 grid grid-cols-2 gap-1.5 overflow-hidden rounded-2xl">
      {media.map((item, index) => {
        const isLoneLast = media.length % 2 === 1 && index === media.length - 1;
        return (
          <div
            key={item.id}
            className={`bg-gray-100 ${isLoneLast ? "col-span-2 aspect-video" : "aspect-square"}`}
          >
            <MediaItem item={item} className="h-full w-full object-cover" />
          </div>
        );
      })}
    </div>
  );
};

export default MediaGrid;