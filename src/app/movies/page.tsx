import CategorySection from '@/components/Section/CategorySection'
import JumperSection from '@/components/Section/JumperSection'
import React from 'react'
import BannerSection from '@/components/Section/BannerSection'
import { api, ENDPOINT } from '@/lib/endpoint'

async function getBannerData() {
  const response = await api.get(ENDPOINT.fetchActionMovies);
  return response.data?.media?.results || [];
}

function Tv() {
   const list = [
        {
            label: "Top Comedy Movies",
            href: "comedy",
            fetcher: async () => {
                return (await api.get(ENDPOINT.fetchComedyMovies)).data?.media?.results || [];
            },
        },
        {
            label: "Top Horror Movies",
            href: "horror",
            fetcher: async () => {
                return (await api.get(ENDPOINT.fetchHorrorMovies)).data?.media?.results || [];
            },
        },
        {
            label: "Top Romance Movies",
            href: "romance",
            fetcher: async () => {
                return (await api.get(ENDPOINT.fetchRomanceMovies)).data?.media?.results || [];
            },
        },
        {
            label: "Top Action Movies",
            href: "action",
            fetcher: async () => {
                return (await api.get(ENDPOINT.fetchActionMovies)).data?.media?.results || [];
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
