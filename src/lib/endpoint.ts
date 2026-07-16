import axios from "axios";

export const ENDPOINT = {
    // auth
    login: "/auth/login",
    signup: "/auth/signup",

    // logout , user pending
    user: "/user",
    logout: "/auth/logout",
    forgetpassword: "/auth/forgetpassword",
    resetPassword: "/auth/resetPassword",

    //discover
    discoverNowPlaying: "/discover/now-playing",
    discoverTrending: "/discover/trending",
    discoverTopRated: "/discover/top-rated",
    discoverUpcoming: "/discover/upcoming",
    
    // movies
    fetchActionMovies: `/movies/action`,
    fetchComedyMovies: `/movies/comedy`,
    fetchHorrorMovies: `/movies/horror`,
    fetchRomanceMovies: `/movies/romance`,
    fetchAnimeMovies: `/movies/anime`,

    //tv shows
    fetchActionTvShows: `/tv/action`,
    fetchComedyTvShows: `/tv/comedy`,
    fetchCrimeTvShows: `/tv/crime`,
    fetchDramaTvShows: `/tv/drama`,
    fetchMysteryTvShows: `/tv/mystery`,

    //eextra data 
    getMovieDetails: (id: string | number) => `/movies/details?id=${id}`,
    getTvShowsDetails: (id: string | number) => `/tv/details?id=${id}`,

    //user
    addToWishlist: "/user/wishlist",
    getWishlist: "/user/wishlist",


    //payment
    payment: "/payment/order",
    updatePremium: "/payment/update-premium-access",

    // streaming urls
    fetchAllStreamingVideos: `/premium/video`,
    fetchStreamingVideo: (name: string) => `/premium/video/steam?name=${name}`,
    fetchVideoThumbnail: (name: string) => `/premium/video/thumbnail?name=${name}`,

    //search movies
    searchAllMovies: (name: string) => `/movies/search/?movieName=${name}`
}

export const media = (path: string | null | undefined, exception?: string): string => `https://image.tmdb.org/t/p/original` + (path || exception || "");

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://jio-clone-backend-2.onrender.com";

export const api = axios.create({
    baseURL: API_BASE_URL,
    // credentials
    withCredentials: true,
});


export const getUrlDetails = (vid: string | number, mediaType: string): string => {
    return mediaType === "tv" ? "/tv/watch?id=" + vid : "/movies/watch?id=" + vid 
}


export const getStreamingVideoThumbnail = (name: string): string =>
    (API_BASE_URL || "") + ENDPOINT.fetchVideoThumbnail(name);
