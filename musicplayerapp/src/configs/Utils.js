export const renderDescription = (description, nullText = "Không có mô tả cho bài hát này") => {
    if (!description) {
        return nullText;
    }

    const urlPattern = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#/%?=~_|!:,.;]*[-A-Z0-9+&@#/%=~_|])/ig;
    const processedDescription = description.replace(urlPattern, (url) => (
        `<a href="${url}" target="_blank" rel="noopener noreferrer" class="description-link">${url}</a>`
    ));

    return (
        <span dangerouslySetInnerHTML={{ __html: processedDescription }} />
    );
};