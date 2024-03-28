import React, {useEffect, useState} from "react";

//INTERNAL IMPORT
import images from "../Images/index";
import {Str1} from "./index";
import Image from "next/image";

export default ({
    openProfile,
    setOpenProfile,
    currentUser,
    getShipmentsCount
}) => {
  const [count, setCount] = useState();
  useEffect(() => {
    const getShipmentsData = getShipmentsCount();

    return async() => {
        const allData = await getShipmentsData;
        setCount(allData);
    }
  }, []);


  return openProfile ? (
      <div className="fixed inset-0 z-10 overflow-y-auto">
        <div
            className="fixed inset-0 w-full h-full bg-black opacity-40"
            onClick={() => setOpenProfile(false)}
        >
        </div>
          <div className="flex items-center min-h-screen px-4 py-8">
              <div className="relative w-full max-w-lg p-4 mx-auto bg-white rounded-md shadow-lg">
                  <div className="flex justify-end">
                      <button
                          className="p-2 text-gray-400"
                      >
                          <Str1/>
                      </button>
                  </div>
                  <div className="max-w-sm mx-auto py-3 space-y-3 text-center">
                      <div className="flex flex-col items-center pb-10">
                          <Image src={images.avatar} alt="avatar"/>
                          <h5 className="mb-1 text-xl font-medium text-gray-900 dark:text-white">
                              WELCOME TRADER
                          </h5>

                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            {currentUser}
                          </span>

                          <div className="flex mt-4 space-x-3 md:mt-6">
                              <a
                                  href="#"
                                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-center text-black rounded-lg border-2"
                              >
                                Balance: 345 ETH
                              </a>
                              <a
                                  href="#"
                                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-center text-black rounded-lg border-2"
                              >
                                  Total Shipment: {count}
                              </a>
                          </div>
                      </div>
                  </div>
          </div>
      </div>
</div>
  ) : ("");
};

