import { useParams } from "react-router-dom";
import { Footer, Header, Sidebar } from "../components";
import '../styles/SongDetailsPage.css';
import { useEffect, useState } from "react";
import { authAPI, endpoints } from "../configs/API";
import moment from "moment";
import { useAudio } from "../configs/AudioContext";
import PageTitle from "../configs/PageTitle";
import { useUser } from "../configs/UserContext";
import LoginRequiredModal from "../components/LoginRequiredModal";

const SongDetailsPage = () => {
    const { isPlaying, pauseSong, playSong, setCurrentSong, currentSong } = useAudio();
    const { getAccessToken, user } = useUser();
    const { id } = useParams();
    const [song, setSong] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        const loadSong = async () => {
            try {
                let token = await getAccessToken();
                let res = await authAPI(token).get(endpoints.song(id));
                setSong(res.data);
            } catch (error) {
                alert("Không thể tải được bài hát");
            }
        };

        loadSong();
    }, [id, setCurrentSong, getAccessToken]);

    const like = async () => {
        if (user) {
            try {
                let res = await authAPI(await getAccessToken()).post(endpoints.like(id));
                setSong(res.data);

                if (isPlaying)
                    setCurrentSong(res.data);
            } catch (error) {
                alert(error);
            }
        } else {
            setIsModalOpen(true);
        }
    };

    const play = () => {
        if (isPlaying)
            pauseSong();
        else
            playSong(song);
    }

    const searchByGenre = async (e, genreId) => {
        e.preventDefault();
    }

    return (
        <div className='d-flex' style={{ flexDirection: 'row' }}>
            <PageTitle title={`${song?.artists} - ${song?.title}`} />
            <Header />
            <div className='sidebar'>
                <Sidebar />
            </div>
            <div className='content w-100'>
                <div className="song-container">
                    <div className="song-detail row">
                        <div className="song-cover col-xxl-3 col-xl-4 col-lg-4 col-md-6 col-sm-12">
                            <img src={song?.image} alt={song?.title} />
                        </div>
                        <div className="song-info col-xxl-9 col-xl-8 col-lg-8 col-md-6">
                            {/* <button className="me-2 play-button" title="Phát bài hát">
                                    <i class="fa-solid fa-play"></i>
                                </button> */}
                            <h1 className="mt-2 mb-2">{song?.title}</h1>
                            <p className="mt-2 mb-4 p-1">Nghệ sĩ: {song?.artists}</p>
                            <div className="d-flex justify-content-end mb-3">
                                <div>
                                    {song?.genres.map(g =>
                                        <a key={g.id}
                                            href="/" className="ms-3 genre"
                                            onClick={(e) => searchByGenre(e, g.id)}>
                                            # {g.name}
                                        </a>)}
                                </div>
                            </div>
                            <div className="d-flex justify-content-between other-info">
                                <div className="">
                                    <img
                                        className="rounded-circle"
                                        src={song?.uploader?.avatar}
                                        alt={song?.uploader?.name}
                                        width={40} />
                                    <span><strong>{song?.uploader?.name}</strong></span>
                                </div>
                                <span>{moment(song?.created_date).fromNow()}</span>
                            </div>
                            <div className="divider"></div>
                            <div className="d-flex align-items-center mb-3">
                                <div className="button-group">
                                    <button type="button" onClick={play} className="me-4 play-button">
                                        {isPlaying && currentSong?.id === song?.id ?
                                            <span><i class="fa-solid fa-pause me-1"></i> Tạm dừng</span> :
                                            <span><i class="fa-solid fa-play me-1"></i> Phát bài hát</span>}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={like}
                                        className={`me-4 ${song?.liked ? 'liked' : ''}`}>
                                        <i class="fa-solid fa-heart me-1"></i> {song?.liked ? 'Bỏ thích' : 'Thích'}
                                    </button>
                                    <div className="mt-md-2">
                                        <span className="me-4">
                                            <i class="fa-solid fa-heart me-1"></i> {song?.likes}
                                        </span>
                                        <span>
                                            <i class="fa-solid fa-play me-1"></i> {song?.streams}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            {/* <div className="song-lyrics">
                                <h2>Lyrics</h2>
                                <p>{song?.lyrics}</p>
                            </div> */}
                            {/* <div className="song-controls">
                                <button>Play</button>
                                <button>Pause</button>
                                <button>Next</button>
                            </div> */}
                            <br />
                        </div>
                    </div>
                </div>
                <LoginRequiredModal
                    isModalOpen={isModalOpen}
                    setIsModalOpen={setIsModalOpen} />
                <Footer />
            </div>
        </div>
    )
}

export default SongDetailsPage;