import React from 'react';
import Video from '../Video/Video';
import CarousellComponent from '../CarousellComponent/CarousellComponent';
import MainGraphics from '../MainGraphics/MainGraphics';
import EventSpecialPage from '../EventSpecialPage/EventSpecialPage';
import ChooseForMeBanner from '../ChooseForMeBanner/ChooseForMeBanner';
import Megapackage from '../Megapackage/Megapackage';
import Bestsellers from '../Bestsellers/Bestsellers';
import Addons from '../Addons/Addons';
import Moments from '../Moments/Moments';
function Home() {
  return (
    <div>
   <>
   <CarousellComponent/>
   <MainGraphics/>
   <EventSpecialPage/>
   <ChooseForMeBanner/>
   <Bestsellers/>
   <Megapackage/>
   <Addons/>
   <Moments/>
<Video/>
   </>
    
    
    </div>
  );
}

export default Home;
