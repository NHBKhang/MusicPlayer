import { useEffect } from 'react';

export const usePageTitle = ({ title = null, defaultTitle = true }) => {
    useEffect(() => {
        if (defaultTitle) {
            if (title) {
                document.title = title;
            } else {
                document.title = "SoundScape";
            }
        } else {
            document.title = `SoundScape | ${title}`;
        }
    }, [title, defaultTitle]);
};

const PageTitle = ({ title = null, defaultTitle = true }) => {
    useEffect(() => {
        if (defaultTitle) {
            if (title) {
                document.title = title;
            } else {
                document.title = "SoundScape";
            }
        } else {
            document.title = `SoundScape | ${title}`;
        }
    }, [title, defaultTitle]);

    return null;
};

export default PageTitle;