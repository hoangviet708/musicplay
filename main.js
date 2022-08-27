const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const PLAYER_STORAGE_KEY = 'F8_PLAYER'

const player = $('.player');
const cd = $('.cd');
const heading = $('header h2');
const cdThumb = $('.cd-thumb');
const audio = $('#audio');
const playBtn = $('.btn-toggle-play')
const progress = $('#progress');
const nextBtn = $('.btn-next')
const prevBtn = $('.btn-prev')
const randomBtn = $('.btn-random')
const repeatBtn = $('.btn-repeat')
const playlist = $('.playlist')



const app = {
    currentIndex: 0,
    isPlaying: false,
    isRandom: false,
    isRepeat: false,
    config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},
    songs: [
        {
            name: "Yêu Đương Khó Quá Thì Chạy Về Khóc Với Anh",
            singer: "ERIK",
            path: "./music/song1.mp3",
            image: "./img/img1.jpeg"
        },
        {
            name: "Ngày Đầu Tiên",
            singer: "Đức Phúc",
            path: "./music/song2.mp3",
            image: "./img/img2.jpeg",
        },
        {
            name: "Là Do Em Xui Thôi",
            singer: "Khói, Sofia, Châu Đăng Khoa",
            path: "./music/song3.mp3",
            image: "./img/img3.jpeg"
        },
        {
            name: "Thê Lương",
            singer: "Phúc Chinh",
            path: "./music/song4.mp3",
            image: "./img/img4.jpeg"
        },
        {
            name: "Đế Vương",
            singer: "Đình Dũng, ACV",
            path: "./music/song5.mp3",
            image: "./img/img5.jpeg"
        },
        {
            name: "Có Em Đây",
            singer: "Như Việt, Dunghoangpham, ACV",
            path: "./music/song6.mp3",
            image: "./img/img6.jpeg"
        },
        {
            name: "Có Em Đây",
            singer: "Như Việt, Dunghoangpham, ACV",
            path: "./music/song6.mp3",
            image: "./img/img6.jpeg"
        },
        {
            name: "Đế Vương",
            singer: "Đình Dũng, ACV",
            path: "./music/song5.mp3",
            image: "./img/img5.jpeg"
        },
    ],
    setConfig: function(key,value) {
        this.config[key] =  value;
        localStorage.setItem(PLAYER_STORAGE_KEY,JSON.stringify(this.config))
    } ,
    render: function () {
        const htmls = this.songs.map((song,index) => {
            return `
            <div class="song ${index === this.currentIndex ? 'active' : ''}" data-index="${index}">
                <div class="thumb" style="background-image: url('${song.image}');">
                </div>
                <div class="body">
                    <h3 class="title">${song.name}</h3>
                    <p class="author">${song.singer}</p>
                </div>
                <div class="option">
                    <i class="fas fa-ellipsis-h"></i>
                </div>
            </div>
        `
        })

        $('.playlist').innerHTML = htmls.join('');
    },
    defineProperties: function () {
        Object.defineProperty(this, 'currentSong', {
            get: function () {
                return this.songs[this.currentIndex];
            }
        })
    },
    handleEvents: function () {
        const _this = this;

        //Xử lý CD quay/dừng
        const cdThumbAnimate = cdThumb.animate([
            { transform: 'rotate(360deg)' }
        ], {
            duration: 10000, //10 seconds
            interations: Infinity
        })
        cdThumbAnimate.pause();

        //ScrollTop phóng to thu nhỏ cd khi cuộn
        const cd = $('.cd');
        const cdWidth = cd.offsetWidth;
        document.onscroll = function () {
            const scrollTop = window.srollY || document.documentElement.scrollTop;
            const newCdWidth = cdWidth - scrollTop;
            cd.style.width = newCdWidth > 0 ? + newCdWidth + 'px' : 0;
            cd.style.opacity = newCdWidth / cdWidth;
        }

        //Xử lý khi clickplay
        playBtn.onclick = function () {
            if (_this.isPlaying) {
                audio.pause();
            } else {
                audio.play();
            }
        }

        // Khi song dc play
        audio.onplay = function () {
            _this.isPlaying = true;
            player.classList.add('playing')
            cdThumbAnimate.play();
        }

        // Khi song dc pause
        audio.onpause = function () {
            _this.isPlaying = false;
            player.classList.remove('playing')
            cdThumbAnimate.pause();
        }

        //Khi tiến độ bài hát thay đổi
        audio.ontimeupdate = function () {
            if (audio.duration) {
                const progressPercent = Math.floor(audio.currentTime / audio.duration * 100);
                progress.value = progressPercent;
            }
        }

        // Xử lý khi tua song
        progress.oninput = function (e) {
            const seekTime = audio.duration / 100 * e.target.value;
            audio.currentTime = seekTime;
        }

        //Khi next song
        nextBtn.onclick = function () {
            if (_this.isRandom) {
                _this.playRandomSong()
            } else {
                _this.nextSong();
            }
            audio.play();
            _this.render()
            _this.scrollToActiveSong()
        }

        //Khi prev song
        prevBtn.onclick = function () {
            if (_this.isRandom) {
                _this.playRandomSong()
            } else {
                _this.prevSong();
            }
            audio.play();
            _this.render()
            _this.scrollToActiveSong()

        }

        //Khi che do random bat tat
        randomBtn.onclick = function () {
            _this.isRandom = !_this.isRandom;
            _this.setConfig('isRandom',_this.isRandom)
            randomBtn.classList.toggle('active', _this.isRandom)
        }

        // Xử lý chệ độ bật lại bài
        repeatBtn.onclick = function(e) {    
            _this.isRepeat = !_this.isRepeat
            _this.setConfig('isRepeat', _this.isRepeat)
            repeatBtn.classList.toggle('active',_this.isRepeat)
        }

        //Xử lý bài hát kết thúc
        audio.onended = function() {
            if(_this.isRepeat) {
                audio.play()
            } else
            nextBtn.click();
        }

        // Lắng nghe hành vi click vào playlist
        playlist.onclick = function(e) {
            const songNode = e.target.closest('.song:not(.active)')
            if(songNode|| e.target.closest('.option')) {
                
                // Xử lý khi click vào song
                if(songNode) {
                   _this.currentIndex = Number(songNode.dataset.index)
                   _this.loadCurrentSong()
                   _this.render()
                   audio.play()
                   
                }
                //Xử lý sự kiện click vào nút song option
                if(e.target.closest('.option')) {

                }
            }
        }

    },
    scrollToActiveSong: function () {
        setTimeout(function () {
          if ((app.currentIndex === 0, 1)) {
            $(".song.active").scrollIntoView({
              behavior: "smooth",
              block: "end",
            });
          } else {
            $(".song.active").scrollIntoView({
              behavior: "smooth",
              block: "nearest",
            });
          }
        }, 300);
      },
    

    loadCurrentSong: function () {
        heading.textContent = this.currentSong.name;
        cdThumb.style.backgroundImage = `url('${this.currentSong.image}')`;
        audio.src = this.currentSong.path;
    },
    loadConfig: function() {
        this.isRandom = this.config.isRandom;
        this.isRepeat = this.config.isRepeat;
    },
    nextSong: function () {
        this.currentIndex++;
        if (this.currentIndex >= this.songs.length) {
            this.currentIndex = 0;
        }
        this.loadCurrentSong();
    },
    prevSong: function () {
        this.currentIndex--;
        if (this.currentIndex < 0) {
            this.currentIndex = this.songs.length - 1;
        }
        this.loadCurrentSong();
    },
    playRandomSong: function () {
        let newIndex
        do {
            newIndex = Math.floor(Math.random() * this.songs.length)
        } while (newIndex === this.currentIndex)
        this.currentIndex = newIndex;
        this.loadCurrentSong();
    },

    start: function () {
        //Gán cấu hình tu config
        this.loadConfig()

        //Định nghĩa các thuộc tính Object
        this.defineProperties();


        //Lắng nghe xử lý các sự kiện
        this.handleEvents();

        //Tải thông tin bài hát đầu tiên vào UI khi chạy ứng dụng
        this.loadCurrentSong();

        //Render danh sách playlist
        this.render();

        //Hiện thị trạng thái ban đầu của repear,rancom
        repeatBtn.classList.toggle('active',this.isRepeat)
        randomBtn.classList.toggle('active',this.isRandom)
    }

}


app.start()


