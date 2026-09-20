export const getAvatarByName = (name: string) => {
    const initials = name.split(" ").slice(0, 2).join("");

    return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=random&color=fff&format=png`;
};

export const formatTime = (time: string) => {
    const date = new Date(time);
    const hours = date.getHours();
    const minutes = date.getMinutes();

    return `${hours < 10 ? "0" + hours : hours}:${minutes < 10 ? "0" + minutes : minutes} ${hours >= 12 ? "PM" : "AM"}`;
}
