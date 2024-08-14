import React, { useEffect, useState } from 'react';
import Page from '.';
import { MusicTabView } from '../components';
import { useSearchParams } from 'react-router-dom';
import API, { endpoints } from '../configs/API';

const SearchPage = () => {
    const [searchParams,] = useSearchParams();
    const [songs, setSongs] = useState([]);
    const query = searchParams.get('q') || '';

    useEffect(() => {
        const loadSongs = async () => {
            try {
                let res = await API.get(`${endpoints.songs}?q=${query}`);
                setSongs(res.data.results);
            } catch (error) {
                console.error(error);
                alert(error);
            }
        };

        loadSongs();
    }, [query]);

    const tabs = [
        // {
        //     label: 'Tất cả',
        //     content: (
        //         <div>
        //             {songs.map((song) => (
        //                 <div key={song.id}>
        //                     <h6>{song.name}</h6>
        //                 </div>
        //             ))}
        //         </div>
        //     ),
        // },
        {
            label: 'Bài hát',
            content: (
                <div>
                    {songs.map((song) => (
                        <SongItem song={song} />
                    ))}
                </div>
            ),
        },
        {
            label: 'Nghệ sĩ',
            content: (
                <ul>
                    {/* {artists.map((artist) => (
                        <li key={artist.id}>{artist.name}</li>
                    ))} */}
                </ul>
            ),
        },
        {
            label: 'Albums',
            content: (
                <ul>
                    {/* {albums.map((album) => (
                        <li key={album.id}>{album.name}</li>
                    ))} */}
                </ul>
            ),
        },
        {
            label: 'Danh sách phát',
            content: (
                <ul>
                    {/* {albums.map((album) => (
                        <li key={album.id}>{album.name}</li>
                    ))} */}
                </ul>
            ),
        },
    ];

    return (
        <Page title={`Kết quả cho ${query}`}>
            <div className="content-container" style={{ position: 'relative', height: '85%' }}>
                <div style={{ position: 'absolute', width: '100%' }}>
                    <p className='m-2 mb-3 p-1 fs-4'>Kết quả tìm cho "{query}"</p>
                    <MusicTabView tabs={tabs} />
                </div>
            </div>
        </Page>
    );
};

const SongItem = ({ song }) => (
    <div key={song.id} className='d-flex p-2'>
        <img
            src={song.image} alt={song.title}
            width={150} height={150} />
        <h6>{song.title}</h6>
    </div>
);

export default SearchPage;