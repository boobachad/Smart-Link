'use client';
import React from 'react'
import { useParams } from 'next/navigation';

function StationDetails() {

    const { id } = useParams();

    console.log("Station Details", id);

  return (
    <div>StationDetails</div>
  )
}

export default StationDetails