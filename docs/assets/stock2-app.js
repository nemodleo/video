// docs/assets/stock2-app.js
(async function () {
    if (sessionStorage.getItem("authorized") !== "true") {
      location.href = "../index.html";
    }
  
    const sidebar = document.getElementById("sidebar");
    const video = document.getElementById("videoPlayer");
    const sidebarToggle = document.getElementById("sidebarToggle");
    const container = document.querySelector(".container");
    const prevBtn = document.getElementById("prevBtn");
    const nextBtn = document.getElementById("nextBtn");
    const welcomeScreen = document.getElementById("welcomeScreen");
    
    let currentVideoIndex = -1; // Start with no video selected
    let allVideos = [];
    
    try {
      console.log("Loading stock2 lectures data...");
      const data = window.stock2LecturesData;
      console.log("Lectures data loaded:", data);

      data.forEach((section, sectionIndex) => {
        const sectionTitle = document.createElement("h3");
        sectionTitle.textContent = section.category;
        sectionTitle.dataset.sectionIndex = sectionIndex;
        sectionTitle.classList.add('collapsed');
        sidebar.appendChild(sectionTitle);
        console.log("Added section:", section.category);

        // Create container for videos in this category
        const categoryVideos = document.createElement("div");
        categoryVideos.className = "category-videos collapsed";
        categoryVideos.dataset.sectionIndex = sectionIndex;

        section.videos.forEach((videoInfo) => {
          allVideos.push(videoInfo);
          const btn = document.createElement("button");
          btn.className = "video-button";
          
          // Create number tag
          const numberTag = document.createElement("span");
          numberTag.className = "video-number";
          numberTag.textContent = videoInfo.number;
          
          // Create title span
          const titleSpan = document.createElement("span");
          titleSpan.className = "video-title";
          titleSpan.textContent = videoInfo.title;
          
          btn.appendChild(numberTag);
          btn.appendChild(titleSpan);
          btn.onclick = () => {
            currentVideoIndex = allVideos.findIndex(v => v.id === videoInfo.id);
            playVideo(videoInfo);
            updateNavigationButtons();
            updateActiveVideo();
          };
          categoryVideos.appendChild(btn);
          console.log("Added video button:", videoInfo.title);
        });

        sidebar.appendChild(categoryVideos);

        // Add click event to section title for toggle
        sectionTitle.addEventListener('click', () => {
          toggleCategory(sectionIndex);
        });
      });
      
      updateNavigationButtons();
      
    } catch (error) {
      console.error("Error loading lectures:", error);
      sidebar.innerHTML = "<p>강의 데이터를 불러올 수 없습니다.</p>";
    }
    
    // Sidebar toggle functionality
    sidebarToggle.addEventListener('click', () => {
      container.classList.toggle('sidebar-hidden');
    });
    
    // Navigation button functionality
    prevBtn.addEventListener('click', () => {
      if (currentVideoIndex > 0) {
        currentVideoIndex--;
        playVideo(allVideos[currentVideoIndex]);
        updateNavigationButtons();
        updateActiveVideo();
      }
    });
    
    nextBtn.addEventListener('click', () => {
      if (currentVideoIndex === -1) {
        // If no video selected, start with first video
        currentVideoIndex = 0;
      } else if (currentVideoIndex < allVideos.length - 1) {
        currentVideoIndex++;
      }
      
      if (currentVideoIndex >= 0 && currentVideoIndex < allVideos.length) {
        playVideo(allVideos[currentVideoIndex]);
        updateNavigationButtons();
        updateActiveVideo();
      }
    });
    
    function updateNavigationButtons() {
      prevBtn.disabled = currentVideoIndex <= 0;
      nextBtn.disabled = currentVideoIndex >= allVideos.length - 1 || currentVideoIndex === -1;
    }
    
    function toggleCategory(sectionIndex) {
      const sectionTitle = document.querySelector(`h3[data-section-index="${sectionIndex}"]`);
      const categoryVideos = document.querySelector(`.category-videos[data-section-index="${sectionIndex}"]`);
      
      if (sectionTitle && categoryVideos) {
        sectionTitle.classList.toggle('collapsed');
        categoryVideos.classList.toggle('collapsed');
      }
    }

    function updateActiveVideo() {
      // Remove active class from all video buttons
      document.querySelectorAll('.video-button').forEach(btn => {
        btn.classList.remove('active');
      });
      
      // Add active class to current video button
      if (currentVideoIndex >= 0 && allVideos[currentVideoIndex]) {
        const currentVideo = allVideos[currentVideoIndex];
        document.querySelectorAll('.video-button').forEach(btn => {
          const numberSpan = btn.querySelector('.video-number');
          if (numberSpan && numberSpan.textContent == currentVideo.number) {
            btn.classList.add('active');
          }
        });
      }
    }
    
    function playVideo(videoInfo) {
      console.log("Playing video:", videoInfo.title, videoInfo.id);
      const m3u8 = `https://storage.googleapis.com/lecture-videos-us/stock2/hls/${videoInfo.id}/${videoInfo.id}.m3u8`;
      console.log("Video URL:", m3u8);
      
      // Hide welcome screen and show video
      welcomeScreen.style.display = 'none';
      video.style.display = 'block';
      
      // Clear any existing video source
      video.pause();
      video.src = '';
      
      if (window.Hls && window.Hls.isSupported()) {
        // Destroy previous HLS instance if exists
        if (window.currentHls) {
          window.currentHls.destroy();
        }
        
        const hls = new window.Hls({
          debug: true,
          enableWorker: false,
          lowLatencyMode: true,
          backBufferLength: 90,
          xhrSetup: function(xhr) {
            xhr.withCredentials = false;
          },
          fetchSetup: function(context, initParams) {
            initParams.mode = 'cors';
            initParams.credentials = 'omit';
            return new Request(context.url, initParams);
          }
        });
        
        window.currentHls = hls;
        
        hls.loadSource(m3u8);
        hls.attachMedia(video);
        
        hls.on(window.Hls.Events.MEDIA_ATTACHED, function() {
          console.log("Media attached");
        });
        
        hls.on(window.Hls.Events.MANIFEST_PARSED, function(event, data) {
          console.log("Manifest parsed, found " + data.levels.length + " quality levels");
          video.play().catch(e => console.error("Play failed:", e));
        });
        
        hls.on(window.Hls.Events.ERROR, function(event, data) {
          console.error("HLS Error:", data);
          if (data.fatal) {
            switch(data.type) {
              case window.Hls.ErrorTypes.NETWORK_ERROR:
                console.log("Fatal network error, trying to recover...");
                hls.startLoad();
                break;
              case window.Hls.ErrorTypes.MEDIA_ERROR:
                console.log("Fatal media error, trying to recover...");
                hls.recoverMediaError();
                break;
              default:
                console.log("Fatal error, cannot recover");
                hls.destroy();
                break;
            }
          }
        });
        
        hls.on(window.Hls.Events.FRAG_LOADED, function(event, data) {
          console.log("Fragment loaded:", data.frag.url);
        });
        
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        console.log("Using native HLS support");
        video.src = m3u8;
        video.addEventListener('loadeddata', function() {
          console.log("Video loaded, attempting to play");
          video.play().catch(e => console.error("Native play failed:", e));
        });
        video.addEventListener('error', function(e) {
          console.error("Native video error:", e);
        });
      } else {
        console.error("HLS not supported in this browser");
        alert("이 브라우저에서는 영상 재생이 지원되지 않습니다.");
      }
    }
  })();