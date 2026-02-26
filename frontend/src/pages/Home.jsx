import React, { useEffect, useState } from 'react'; 
import Slider from 'react-slick';
import { API } from '../api';
import DealsSection from '../components/DealsSection'; 
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

export default function Home() { 
    const [ads, setAds] = useState([]);

    useEffect(() => {
        fetch(`${API}/api/ads`).then(r => r.json()).then(setAds);
    }, []);

    const settings = { autoplay: true, dots: true, infinite: true, slidesToShow: 1, slidesToScroll: 1, autoplaySpeed: 4000 };

    return (
        <div className="container mx-auto p-4">
            {ads.length > 0 && (
                <div className="mb-6">
                    <Slider {...settings}>
                        {ads.map(ad => (
                            <div key={ad._id}>
                                <img src={ad.image} alt={ad.title} className="w-full h-56 object-cover rounded"/>
                            </div>
                        ))}
                    </Slider>
                </div>
            )}
            <DealsSection />
        </div>
    );
}