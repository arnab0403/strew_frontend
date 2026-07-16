import CategorySection from '@/components/Section/CategorySection'
import JumperSection from '@/components/Section/JumperSection'
import React from 'react'
import BannerSection from '@/components/Section/BannerSection'
import { api, ENDPOINT } from '@/lib/endpoint'

function Home() {
  const list = [
    {
      label: "Top Rated",
      href: "top-rated",
      fetcher: async function getTopRatedData() {
          const response = await api.get(ENDPOINT.discoverTopRated);
          return response.data?.nowPlaying?.results || [];
      }
    },
    {
      label: "Popular",
      href: "popular",
      fetcher: async function getPopularData() {
          const response = await api.get(ENDPOINT.discoverTrending);
          return response.data?.nowPlaying?.results || [];
      }
    },
    {
      label: "Upcoming",
      href: "upcoming",
      fetcher: async function getUpcomingData() {
          const response = await api.get(ENDPOINT.discoverUpcoming);
          return response.data?.nowPlaying?.results || [];
      }
    }
  ]

  async function getBannerData() {
    const response = await api.get(ENDPOINT.discoverNowPlaying);
    return response.data?.nowPlaying?.results || [];
  }

  return (
    <>
      <JumperSection list={list} />
      <BannerSection fetcher={getBannerData} />
      {list.map((item) => (
        <CategorySection key={item.href} title={item.label} id={item.href} fetcher={item.fetcher} />
      ))}
    </>
  )
}

export default Home
