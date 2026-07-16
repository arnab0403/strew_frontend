import CategorySection from '@/components/Section/CategorySection'
import JumperSection from '@/components/Section/JumperSection'
import React from 'react'
import BannerSection from '@/components/Section/BannerSection'
import { api, ENDPOINT } from '@/lib/endpoint'

async function getBannerData() {
  const response = await api.get(ENDPOINT.fetchActionTvShows);
  return response.data?.media?.results || [];
}

function Tv() {
  const list = [
        {
            label: "Comedy",
            href: "comedy",
            fetcher: async () => {
                return (await api.get(ENDPOINT.fetchComedyTvShows))?.data?.media?.results || [];
            },
        },
        {
            label: "Crime",
            href: "crime",
            fetcher: async () => {
                return (await api.get(ENDPOINT.fetchCrimeTvShows))?.data?.media?.results || [];
            },
        },
        {
            label: "Drama",
            href: "drama",
            fetcher: async () => {
                return (await api.get(ENDPOINT.fetchDramaTvShows))?.data?.media?.results || [];
            },
        },
        {
            label: "Action",
            href: "action",
            fetcher: async () => {
                return (await api.get(ENDPOINT.fetchActionTvShows))?.data?.media?.results || [];
            },
        },
    ];

  return (
    <>
      <JumperSection list={list}/>
      <BannerSection fetcher={getBannerData}/>
      {list.map((item)=>(
        <CategorySection key={item.href} title={item.label} id={item.href} fetcher={item.fetcher} />
      ))}
    </>
  )
}

export default Tv
