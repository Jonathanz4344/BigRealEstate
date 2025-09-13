import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Data } from "../../config";
import { FourUpSection } from "../../components";

// Main component
const FourUpPage = () => {
  const [showAll, setShowAll] = useState(false);

  // Show only first 2 weeks by default, all if showAll is true
  const fourUps = showAll ? Data.fourUps : Data.fourUps.slice(0, 2);
  const hasMore = Data.fourUps.length > 2;

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-6xl mx-auto">
        {fourUps.map((fourUp) => (
          <FourUpSection key={fourUp.id} fourUp={fourUp} />
        ))}

        {hasMore && (
          <div className="text-center">
            <button
              onClick={() => (
                showAll && window.scrollTo({ top: 0 }),
                setShowAll((prev) => !prev)
              )}
              className="gradient-background cursor-pointer text-white px-6 py-3 rounded-lg flex items-center gap-2 mx-auto transition-colors"
            >
              {showAll ? (
                <>
                  Show Less
                  <ChevronUp size={20} />
                </>
              ) : (
                <>
                  See More
                  <ChevronDown size={20} />
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export { FourUpPage };
