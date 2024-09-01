(function() {
  function mauGallery(options) {
      var options = Object.assign({}, mauGallery.defaults, options);
      var tagsCollection = [];
      
      this.forEach(function(gallery) {
          createRowWrapper(gallery);
          if (options.lightBox) {
              createLightBox(gallery, options.lightboxId, options.navigation);
          }
          addListeners(gallery, options);

          var galleryItems = gallery.querySelectorAll('.gallery-item');
          galleryItems.forEach(function(item) {
              responsiveImageItem(item);
              moveItemInRowWrapper(item);
              wrapItemInColumn(item, options.columns);
              var theTag = item.getAttribute('data-gallery-tag');
              if (options.showTags && theTag !== undefined && tagsCollection.indexOf(theTag) === -1) {
                  tagsCollection.push(theTag);
              }
          });

          if (options.showTags) {
              showItemTags(gallery, options.tagsPosition, tagsCollection);
          }

          gallery.style.display = '';
          gallery.style.opacity = 0;
          setTimeout(() => {
              gallery.style.transition = 'opacity 0.5s';
              gallery.style.opacity = 1;
          }, 10);
      });
  }

  mauGallery.defaults = {
      columns: 3,
      lightBox: true,
      lightboxId: null,
      showTags: true,
      tagsPosition: "bottom",
      navigation: true
  };

  function addListeners(gallery, options) {
      gallery.querySelectorAll('.gallery-item').forEach(item => {
          item.addEventListener('click', function() {
              if (options.lightBox && item.tagName === "IMG") {
                  openLightBox(item, options.lightboxId);
              }
          });
      });

      gallery.addEventListener('click', function(event) {
          if (event.target.classList.contains('nav-link')) {
              filterByTag(event.target);
          } else if (event.target.classList.contains('mg-prev')) {
              prevImage(options.lightboxId);
          } else if (event.target.classList.contains('mg-next')) {
              nextImage(options.lightboxId);
          }
      });
  }

  function createRowWrapper(element) {
      if (!element.children[0] || !element.children[0].classList.contains('row')) {
          var rowWrapper = document.createElement('div');
          rowWrapper.className = 'gallery-items-row row';
          element.appendChild(rowWrapper);
      }
  }

  function wrapItemInColumn(element, columns) {
      var columnClasses = '';
      if (typeof columns === 'number') {
          columnClasses = `col-${Math.ceil(12 / columns)}`;
      } else if (typeof columns === 'object') {
          if (columns.xs) columnClasses += ` col-${Math.ceil(12 / columns.xs)}`;
          if (columns.sm) columnClasses += ` col-sm-${Math.ceil(12 / columns.sm)}`;
          if (columns.md) columnClasses += ` col-md-${Math.ceil(12 / columns.md)}`;
          if (columns.lg) columnClasses += ` col-lg-${Math.ceil(12 / columns.lg)}`;
          if (columns.xl) columnClasses += ` col-xl-${Math.ceil(12 / columns.xl)}`;
      } else {
          console.error(`Columns should be defined as numbers or objects. ${typeof columns} is not supported.`);
          return;
      }

      var column = document.createElement('div');
      column.className = `item-column mb-4${columnClasses}`;
      element.parentNode.insertBefore(column, element);
      column.appendChild(element);
  }

  function moveItemInRowWrapper(element) {
      var rowWrapper = document.querySelector('.gallery-items-row');
      rowWrapper.appendChild(element);
  }

  function responsiveImageItem(element) {
      if (element.tagName === 'IMG') {
          element.classList.add('img-fluid');
      }
  }

  function openLightBox(element, lightboxId) {
      var lightbox = document.getElementById(lightboxId);
      var lightboxImage = lightbox.querySelector('.lightboxImage');
      lightboxImage.src = element.src;
      var modal = new bootstrap.Modal(lightbox);
      modal.show();
  }

  function prevImage(lightboxId) {
      let activeImageSrc = document.querySelector('.lightboxImage').src;
      let imagesCollection = getImageCollection();

      if (!imagesCollection.length) {
          console.error("No images found.");
          return;
      }

      let currentIndex = imagesCollection.findIndex(img => img.src === activeImageSrc);
      let prevIndex = (currentIndex - 1 + imagesCollection.length) % imagesCollection.length;
      let prevImage = imagesCollection[prevIndex];
      document.querySelector('.lightboxImage').src = prevImage.src;
  }

  function nextImage(lightboxId) {
      let activeImageSrc = document.querySelector('.lightboxImage').src;
      let imagesCollection = getImageCollection();

      if (!imagesCollection.length) {
          console.error("No images found.");
          return;
      }

      let currentIndex = imagesCollection.findIndex(img => img.src === activeImageSrc);
      let nextIndex = (currentIndex + 1) % imagesCollection.length;
      let nextImage = imagesCollection[nextIndex];
      document.querySelector('.lightboxImage').src = nextImage.src;
  }

  function createLightBox(gallery, lightboxId, navigation) {
      var lightbox = document.createElement('div');
      lightbox.className = 'modal fade';
      lightbox.id = lightboxId ? lightboxId : 'galleryLightbox';
      lightbox.tabIndex = -1;
      lightbox.role = 'dialog';
      lightbox.setAttribute('aria-hidden', 'true');

      lightbox.innerHTML = `
          <div class="modal-dialog" role="document">
              <div class="modal-content">
                  <div class="modal-body">
                      ${navigation ? '<div class="mg-prev" style="cursor:pointer;position:absolute;top:50%;left:-15px;background:white;"><</div>' : ''}
                      <img class="lightboxImage img-fluid" alt="Contenu de l'image affichée dans la modale au clique"/>
                      ${navigation ? '<div class="mg-next" style="cursor:pointer;position:absolute;top:50%;right:-15px;background:white;">></div>' : ''}
                  </div>
              </div>
          </div>`;
      gallery.appendChild(lightbox);
  }

  function showItemTags(gallery, position, tags) {
      var tagItems = `
          <li class="nav-item"><span class="nav-link active active-tag" data-images-toggle="all">Tous</span></li>`;
      tags.forEach(function(tag) {
          tagItems += `<li class="nav-item"><span class="nav-link" data-images-toggle="${tag}">${tag}</span></li>`;
      });
      var tagsRow = `<ul class="my-4 tags-bar nav nav-pills">${tagItems}</ul>`;

      if (position === 'bottom') {
          gallery.insertAdjacentHTML('beforeend', tagsRow);
      } else if (position === 'top') {
          gallery.insertAdjacentHTML('afterbegin', tagsRow);
      } else {
          console.error(`Unknown tags position: ${position}`);
      }
  }

  function filterByTag(tagElement) {
      if (tagElement.classList.contains('active-tag')) {
          return;
      }
      document.querySelector('.active-tag').classList.remove('active', 'active-tag');
      tagElement.classList.add('active-tag');

      tagElement.classList.add('active', 'active-tag');

      var tag = tagElement.getAttribute('data-images-toggle');
      var galleryItems = document.querySelectorAll('.gallery-item');
  
      galleryItems.forEach(function(item) {
          var itemColumn = item.closest('.item-column');
          if (tag === 'all' || item.getAttribute('data-gallery-tag') === tag) {
              itemColumn.style.display = '';
          } else {
              itemColumn.style.display = 'none';
          }
      });
  }

  function getImageCollection() {
      let imagesCollection = [];
      let activeTag = document.querySelector('.tags-bar .active-tag').getAttribute('data-images-toggle');

      document.querySelectorAll('.item-column img').forEach(function(img) {
          if (activeTag === 'all' || img.getAttribute('data-gallery-tag') === activeTag) {
              imagesCollection.push(img);
          }
      });
      return imagesCollection;
  }

  NodeList.prototype.mauGallery = HTMLCollection.prototype.mauGallery = mauGallery;

})();
