import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../configs/UserContext";
import { authAPI, endpoints } from "../configs/API";
import VerifiedBadge from "./VerifiedBadge";
import '../styles/ArtistItem.css';

const ArtistItem = ({ artist, state }) => {
    const [item, setItem] = useState(artist);
    const { setIsModalOpen } = state;
    const { getAccessToken, user } = useUser();
    const navigate = useNavigate();

    const goToArtist = () => {
        navigate(`/profile/${item.id}/`);
    };

    const follow = async () => {
        if (user) {
            try {
                let res = await authAPI(await getAccessToken())
                    .post(endpoints.follow(item?.id));
                setItem(res.data);
            } catch (error) {
                console.error(error);
                alert("Lỗi");
            }
        } else {
            setIsModalOpen(true);
        }
    };

    return (
        <div key={item.id} className='artist-item cursor-pointer'>
            <img onClick={goToArtist}
                src={item.avatar} alt={item.name}
                width={120} height={120} className='artist-cover rounded-circle' />
            <div className='ms-4 text-start mt-1'>
                <h5 onClick={goToArtist}>
                    {item.name}
                    {item.info?.verified && <VerifiedBadge />}
                </h5>
                <div className='mb-2 mt-1 d-flex justify-content-evenly w-100' onClick={goToArtist}>
                    <div className='d-flex align-items-center'>
                        <i class="fa-solid fa-users text-white"></i>
                        <p className='mb-0 ms-1'>{item.followers}</p>
                    </div>
                    <div className='d-flex align-items-center ms-2'>
                        <i class="fa-solid fa-music text-white"></i>
                        <p className='mb-0 ms-1'>{item.songs}</p>
                    </div>
                </div>
                <button onClick={follow}
                    className={`mt-1 mb-2 follow-button ${item?.followed ? 'followed' : ''}`}>
                    {item?.followed ? <>
                        <i class="fa-solid fa-user-check"></i>
                        <p className='d-none d-lg-inline text-black'> Đã theo dõi</p>
                    </> : <>
                        <i class="fa-solid fa-user-plus"></i>
                        <p className='d-inline text-black p-1'> Theo dõi</p>
                    </>}
                </button>
            </div>
        </div>
    )
};

export default ArtistItem;