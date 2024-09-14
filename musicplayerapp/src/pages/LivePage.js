import { useEffect, useRef, useState } from "react";
import Page from "."
import { authAPI, endpoints } from "../configs/API";
import { useUser } from "../configs/UserContext";
import { VideoItem } from "../components";

const LivePage = () => {
    const contentRef = useRef(null);
    const [activeTab, setActiveTab] = useState(0);
    const [data, setData] = useState([[], []]);
    const [page, setPage] = useState([1, 1]);
    const urls = [endpoints, endpoints["live-videos"]];
    const { getAccessToken } = useUser();

    const updateData = (index, data) => {
        setData(prevData => {
            const updatedData = [...prevData];
            updatedData[index] = data;
            return updatedData;
        });
    };

    const handleTabClick = (index) => {
        setActiveTab(index);
    };

    useEffect(() => {
        if (contentRef.current) {
            contentRef.current.scrollTop = contentRef.current.scrollHeight;
        }
    }, [activeTab]);

    useEffect(() => {
        const loadData = async () => {
            try {
                let res = await authAPI(await getAccessToken())
                    .get(urls[activeTab]);
                updateData(activeTab, res.data);
            } catch (error) {
                console.error(error);
            }
        }

        loadData();
    }, [activeTab]);

    const tabs = [
        {
            label: 'Đang trực tiếp',
            content: (
                <div>

                </div>
            ),
        }, {
            label: 'Sắp diễn ra',
            content: (
                <div>
                    {data[activeTab].map(d => <div>
                        <VideoItem video={d} />
                    </div>)}
                </div>
            ),
        },
    ]

    return (
        <Page title={"Các phiên trực tiếp"}>
            <div className="music-tabview">
                <div className="music-tabview-fixed">
                    <h3 className="mt-1">Các phiên trực tiếp {activeTab === 0 ? 'đang' : 'sắp'} diễn ra</h3>
                    <div className="music-tab-headers">
                        {tabs.map((tab, index) => (
                            <button
                                key={index}
                                className={`music-tab-button ${activeTab === index ? 'music-active' : ''}`}
                                onClick={() => handleTabClick(index)}>
                                {tab.label}
                            </button>
                        ))
                        }
                    </div>
                </div>
                <div className="music-tab-content w-100" ref={contentRef}>
                    {tabs.map((tab, index) => (<div
                        key={index}
                        className={`music-tab-pane ${activeTab === index ? 'music-active' : 'music-inactive'}`}>
                        {tab.content}
                    </div>)
                    )}
                </div>
            </div>
        </Page>
    )
};

export default LivePage;