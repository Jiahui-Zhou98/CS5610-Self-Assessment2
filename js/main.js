// DOM elements
const inTitle = document.querySelector("#input-title");
const inPrice = document.querySelector("#input-price");
const inDescription = document.querySelector("#input-description");
const btnCancel = document.querySelector("#btnCancel");
const listingsContainer = document.querySelector("#listings-container");

// Store all listings
let allListings = [];

// Cancel button handler
const onClickCancel = (evt) => {
  evt.preventDefault();
  inTitle.value = "";
  inPrice.value = 80;
  inDescription.value = "";
};

btnCancel.addEventListener("click", onClickCancel);

// Fetch listings from JSON file
const loadListings = async () => {
  try {
    const response = await fetch("./listings.json");
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    allListings = data;
    displayListings(allListings);
  } catch (error) {
    console.error("Error loading listings:", error);
  }
};

// Display listings
const displayListings = (listings) => {
  listingsContainer.innerHTML = "";

  listings.forEach((listing) => {
    const listingCard = createListingCard(listing);
    listingsContainer.appendChild(listingCard);
  });
};

// Create a listing card element
const createListingCard = (listing) => {
  const colDiv = document.createElement("div");
  colDiv.className = "listing col-12 col-md-6 col-lg-4 mb-4";

  // Parse amenities
  let amenitiesList = [];
  if (Array.isArray(listing.amenities)) {
    amenitiesList = listing.amenities;
  } else if (typeof listing.amenities === "string") {
    try {
      amenitiesList = JSON.parse(listing.amenities.replace(/""/g, '"'));
    } catch (e) {
      // If parsing fails, try splitting by comma
      amenitiesList = listing.amenities
        .replace(/[\[\]"]/g, "")
        .split(",")
        .map((a) => a.trim())
        .filter((a) => a);
    }
  }

  // Format price
  const price = listing.price ? listing.price.replace("$", "") : "0";
  const priceNum = parseFloat(price.replace(",", ""));

  // Get host photo or use placeholder
  const hostPhoto =
    listing.host_picture_url ||
    listing.host_thumbnail_url ||
    "https://via.placeholder.com/50";

  // Get thumbnail
  const thumbnail =
    listing.picture_url ||
    "https://via.placeholder.com/400x300?text=No+Image";

  // Format amenities display (show first 5)
  const amenitiesDisplay = amenitiesList.slice(0, 5).join(" • ");
  const moreAmenities = amenitiesList.length > 5
    ? ` +${amenitiesList.length - 5} more`
    : "";

  // Get rating
  const rating = listing.review_scores_rating
    ? parseFloat(listing.review_scores_rating).toFixed(1)
    : "N/A";

  // Create article element (card)
  const article = document.createElement("article");
  article.className = "card h-100 listing-card";

  // Create thumbnail container
  const thumbnailContainer = document.createElement("div");
  thumbnailContainer.className = "thumbnail-container";

  // Create thumbnail image
  const thumbnailImg = document.createElement("img");
  thumbnailImg.src = thumbnail;
  thumbnailImg.alt = listing.name || "Listing";
  thumbnailImg.className = "card-img-top listing-thumbnail";
  thumbnailImg.addEventListener("error", () => {
    thumbnailImg.src = "https://via.placeholder.com/400x300?text=Image+Not+Available";
  });

  // Create price badge
  const priceBadge = document.createElement("div");
  priceBadge.className = "price-badge";
  priceBadge.textContent = `$${priceNum.toFixed(0)}/night`;

  // Assemble thumbnail container
  thumbnailContainer.appendChild(thumbnailImg);
  thumbnailContainer.appendChild(priceBadge);

  // Create card body
  const cardBody = document.createElement("div");
  cardBody.className = "card-body";

  // Create title
  const title = document.createElement("h3");
  title.className = "card-title listing-title";
  title.textContent = listing.name || "Untitled Listing";

  // Create host info container
  const hostInfo = document.createElement("div");
  hostInfo.className = "host-info mb-2";

  // Create host photo
  const hostPhotoImg = document.createElement("img");
  hostPhotoImg.src = hostPhoto;
  hostPhotoImg.alt = listing.host_name || "Host";
  hostPhotoImg.className = "host-photo";
  hostPhotoImg.addEventListener("error", () => {
    hostPhotoImg.src = "https://via.placeholder.com/40?text=H";
  });

  // Create host name
  const hostName = document.createElement("span");
  hostName.className = "host-name";
  hostName.textContent = listing.host_name || "Unknown Host";

  // Assemble host info
  hostInfo.appendChild(hostPhotoImg);
  hostInfo.appendChild(hostName);

  // Create superhost badge if applicable
  if (listing.host_is_superhost === "t") {
    const superhostBadge = document.createElement("span");
    superhostBadge.className = "badge bg-warning text-dark superhost-badge";
    superhostBadge.textContent = "Superhost";
    hostInfo.appendChild(superhostBadge);
  }

  // Create rating container
  const ratingDiv = document.createElement("div");
  ratingDiv.className = "rating mb-2";

  // Create rating stars
  const ratingStars = document.createElement("span");
  ratingStars.className = "rating-stars";
  ratingStars.textContent = getStarRating(rating);

  // Create rating text
  const ratingText = document.createElement("span");
  ratingText.className = "rating-text";
  ratingText.textContent = `${rating}`;

  // Assemble rating
  ratingDiv.appendChild(ratingStars);
  ratingDiv.appendChild(ratingText);

  // Create description
  const description = document.createElement("div");
  description.className = "description mb-3";
  description.textContent = truncateText(
    listing.description || "No description available",
    150
  );

  // Create amenities container
  const amenitiesDiv = document.createElement("div");
  amenitiesDiv.className = "amenities mb-3";

  // Create amenities label
  const amenitiesLabel = document.createElement("strong");
  amenitiesLabel.textContent = "Amenities:";

  // Create amenities list
  const amenitiesListElement = document.createElement("div");
  amenitiesListElement.className = "amenities-list";
  amenitiesListElement.textContent = amenitiesDisplay + moreAmenities;

  // Assemble amenities
  amenitiesDiv.appendChild(amenitiesLabel);
  amenitiesDiv.appendChild(amenitiesListElement);

  // Create listing details
  const listingDetails = document.createElement("div");
  listingDetails.className = "listing-details mb-3";

  const detailsText = document.createElement("small");
  detailsText.className = "text-muted";
  detailsText.textContent = `${listing.property_type || ""} • ${listing.room_type || ""
    } • ${listing.accommodates || "?"} guests`;

  listingDetails.appendChild(detailsText);

  // Create actions container
  const actions = document.createElement("div");
  actions.className = "actions";

  // Create view details button
  const viewDetailsBtn = document.createElement("button");
  viewDetailsBtn.className = "btn btn-primary w-100";
  viewDetailsBtn.textContent = "View Details";

  actions.appendChild(viewDetailsBtn);

  // Assemble card body
  cardBody.appendChild(title);
  cardBody.appendChild(hostInfo);
  cardBody.appendChild(ratingDiv);
  cardBody.appendChild(description);
  cardBody.appendChild(amenitiesDiv);
  cardBody.appendChild(listingDetails);
  cardBody.appendChild(actions);

  // Assemble article
  article.appendChild(thumbnailContainer);
  article.appendChild(cardBody);

  // Assemble column div
  colDiv.appendChild(article);

  return colDiv;
};

// Helper function to truncate text
const truncateText = (text, maxLength) => {
  if (!text) return "";
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
};

// Helper function to get star rating display
const getStarRating = (rating) => {
  if (rating === "N/A") return "⭐";
  const numRating = parseFloat(rating);
  const fullStars = Math.floor(numRating);
  const hasHalfStar = numRating % 1 >= 0.5;
  let stars = "⭐".repeat(fullStars);
  if (hasHalfStar && fullStars < 5) stars += "⭐";
  return stars || "⭐";
};

// Load listings when page loads
document.addEventListener("DOMContentLoaded", loadListings);