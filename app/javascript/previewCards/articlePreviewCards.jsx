import { h, render } from 'preact';
import { request } from '@utilities/http';
import { initializeDropdown } from '@utilities/dropdownUtils';
import { getDropdownRepositionListener } from '@utilities/dropdownUtils';

const cachedArticleMetadata = {};

function renderMetadata(articleMetadata, metadataPlaceholder) {
  const articlePreviewCard = (
    <div class="gap-4 grid">
      <div class="-mt-4">
        <a href={articleMetadata.url} class="flex">
          {articleMetadata.cover_image && (
            <div class="mr-3 shrink-0">
              <img
                src={articleMetadata.cover_image}
                alt={articleMetadata.title}
                class="crayons-avatar crayons-avatar--xl"
                width="64"
                height="64"
                style="object-fit: cover; border-radius: var(--radius);"
              />
            </div>
          )}
          <div class="flex-1 min-w-0">
            <h3 class="fs-l fw-bold mb-1 color-base-100 line-clamp-2">
              {articleMetadata.title}
            </h3>
            {articleMetadata.body_preview && (
              <p class="color-base-70 fs-s mb-2 line-clamp-2">
                {articleMetadata.body_preview}
              </p>
            )}
          </div>
        </a>
      </div>

      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <a href={`/${articleMetadata.user.username}`} class="flex items-center gap-2 color-base-70 hover:color-base-100">
            <img
              src={articleMetadata.user.profile_image_90}
              alt={articleMetadata.user.name}
              class="crayons-avatar crayons-avatar--s"
              width="24"
              height="24"
            />
            <span class="fs-s fw-medium">{articleMetadata.user.name}</span>
          </a>
          {articleMetadata.organization && (
            <>
              <span class="color-base-60">for</span>
              <a href={`/${articleMetadata.organization.slug}`} class="flex items-center gap-1 color-base-70 hover:color-base-100">
                <img
                  src={articleMetadata.organization.profile_image_90}
                  alt={articleMetadata.organization.name}
                  class="crayons-avatar crayons-avatar--s"
                  width="20"
                  height="20"
                />
                <span class="fs-s">{articleMetadata.organization.name}</span>
              </a>
            </>
          )}
        </div>
        <div class="flex items-center gap-3 color-base-60 fs-xs">
          <span>{getTimeAgo(articleMetadata.published_at)} ago</span>
          <span>{articleMetadata.reading_time} min read</span>
        </div>
      </div>

      {articleMetadata.tag_list && articleMetadata.tag_list.length > 0 && (
        <div class="flex flex-wrap gap-1">
          {articleMetadata.tag_list.slice(0, 3).map(tag => (
            <a href={`/t/${tag}`} class="crayons-tag crayons-tag--monochrome crayons-tag--s">
              <span class="crayons-tag__prefix">#</span>{tag}
            </a>
          ))}
          {articleMetadata.tag_list.length > 3 && (
            <span class="color-base-60 fs-xs">+{articleMetadata.tag_list.length - 3} more</span>
          )}
        </div>
      )}

      <div class="flex items-center justify-between pt-2 border-t border-base-20">
        <div class="flex items-center gap-3 color-base-60 fs-s">
          <span class="flex items-center gap-1">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" class="crayons-icon">
              <path d="M18.884 12.595l.01.011L12 19.5l-6.894-6.894.01-.01A4.875 4.875 0 0112 5.73a4.875 4.875 0 016.884 6.865z"/>
            </svg>
            {articleMetadata.public_reactions_count}
          </span>
          <span class="flex items-center gap-1">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" class="crayons-icon">
              <path d="M10.5 5h3a6 6 0 110 12v2.625c-3.75-1.5-9-3.75-9-8.625a6 6 0 016-6z"/>
            </svg>
            {articleMetadata.comments_count}
          </span>
        </div>
        <a href={articleMetadata.url} class="crayons-btn crayons-btn--secondary crayons-btn--s">
          Read more
        </a>
      </div>
    </div>
  );

  render(articlePreviewCard, metadataPlaceholder);
}

function getTimeAgo(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < 60) return 'just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} min`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hr`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} day`;
  if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)} month`;
  return `${Math.floor(diffInSeconds / 31536000)} year`;
}

async function populateMissingMetadata(metadataPlaceholder) {
  const { articleId, fetched } = metadataPlaceholder.dataset;

  // If the metadata is already being fetched, do nothing
  if (fetched === 'true') {
    return;
  }
  metadataPlaceholder.dataset.fetched = 'true';

  const previouslyFetchedArticleMetadata = cachedArticleMetadata[articleId];

  if (previouslyFetchedArticleMetadata) {
    renderMetadata(previouslyFetchedArticleMetadata, metadataPlaceholder);
  } else {
    try {
      const response = await request(`/article_preview_cards/${articleId}`);
      const articleMetadata = await response.json();

      cachedArticleMetadata[articleId] = articleMetadata;
      renderMetadata(articleMetadata, metadataPlaceholder);
    } catch (error) {
      console.error('Failed to fetch article preview:', error);
      metadataPlaceholder.innerHTML = '<div class="color-base-60 fs-s">Failed to load preview</div>';
    }
  }
}

function checkForPreviewCardDetails(event) {
  const { target } = event;
  const previewTrigger = target.closest('[data-article-preview-trigger]');

  if (previewTrigger) {
    const articleId = previewTrigger.getAttribute('data-article-preview-trigger');
    const dropdownElement = document.getElementById(`story-article-preview-content-${articleId}`);
    const metadataPlaceholder = dropdownElement?.querySelector('.article-preview-placeholder');

    if (metadataPlaceholder) {
      populateMissingMetadata(metadataPlaceholder);
    }
  }
}

export function listenForHoveredOrFocusedArticleCards() {
  const mainContent = document.getElementById('main-content');

  mainContent.addEventListener('mouseover', checkForPreviewCardDetails);
  mainContent.addEventListener('focusin', checkForPreviewCardDetails);
}

export function initializeArticlePreviewCards() {
  // Select all article preview card triggers that haven't already been initialized
  const allPreviewCardTriggers = document.querySelectorAll(
    '[data-article-preview-trigger]:not([data-initialized])',
  );

  for (const previewTrigger of allPreviewCardTriggers) {
    const articleId = previewTrigger.getAttribute('data-article-preview-trigger');
    const dropdownContentId = `story-article-preview-content-${articleId}`;
    const dropdownElement = document.getElementById(dropdownContentId);

    if (dropdownElement) {
      // Create a unique trigger ID for the dropdown system
      const triggerElementId = `article-preview-trigger-${articleId}`;
      previewTrigger.id = triggerElementId;

      initializeDropdown({
        triggerElementId,
        dropdownContentId,
        onOpen: () => dropdownElement?.classList.add('showing'),
        onClose: () => dropdownElement?.classList.remove('showing'),
      });

      previewTrigger.dataset.initialized = true;
    }
  }
}

const observer = new MutationObserver((mutationsList) => {
  mutationsList.forEach((mutation) => {
    if (mutation.type === 'childList') {
      initializeArticlePreviewCards();
    }
  });
});

if (document.getElementById('index-container')) {
  observer.observe(document.getElementById('index-container'), {
    childList: true,
    subtree: true,
  });
}

// Article preview card dropdowns reposition on scroll
const dropdownRepositionListener = getDropdownRepositionListener();
document.addEventListener('scroll', dropdownRepositionListener);

InstantClick.on('change', () => {
  observer.disconnect();
  document.removeEventListener('scroll', dropdownRepositionListener);
});
