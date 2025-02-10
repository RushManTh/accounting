"use client";

import { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import skudata from "@/app/skudata.json";
import skudataPumaNew from "@/app/skudataPumaNew.json";
import skudataPowderNew from "@/app/skudataPowderNew.json";

export default function Home() {
  const [file1Data, setFile1Data] = useState([]);
  const [file2Data, setFile2Data] = useState([]);
  const [mergedData, setMergedData] = useState([]);
  const [boxCost, setBoxCost] = useState([]);
  const [adsCost, setAdsCost] = useState(0);
  const [selected, setSelected] = useState(1);
  const [pumaMeat, setPumaMeat] = useState(0);
  const [pumaEggs, setPumaEggs] = useState(0);
  const [pumaFat, setPumaFat] = useState(0);
  const [powderMini, setPowderMini] = useState(0);
  const [powderMedium, setPowderMedium] = useState(0);
  const [onionsMini, setOnionsMini] = useState(0);
  const [onionsMedium, setOnionsMedium] = useState(0);
  const [sauce, setSauce] = useState(0);
  const [skudataPumaNew, setSkudataPumaNew] = useState([]);
  const [skudataPowderNew, setSkudataPowderNew] = useState([]);

  useEffect(() => {
    fetch(
      "https://script.google.com/macros/s/AKfycby1vjgSkNH6df-1aihmTQGhKuQ-9H4pfZJBw8Z9-h8YlwTJe6GAuRMYwEQGI7jVwPTP2w/exec"
    )
      .then((res) => res.json())
      .then((data) => setSkudataPumaNew(data))
      .catch((err) => console.error("Error fetching data:", err));
  }, []);

  useEffect(() => {
    fetch(
      "https://script.google.com/macros/s/AKfycbzkCpXud9vmQYvyUaFU6UWWxz1eeEZue0dMNzZCoJ1zKvCh-9Z1SQ-2t6NYFTWQ-9RR/exec"
    )
      .then((res) => res.json())
      .then((data) => setSkudataPowderNew(data))
      .catch((err) => console.error("Error fetching data:", err));
  }, []);

  const options = [
    { id: 1, label: "น้ำพริกปูม้า" },
    { id: 2, label: "แป้งหมักไก่" },
    { id: 3, label: "ทั้งหมด" },
  ];

  const calculateCost = (data, pumaMeat, pumaEggs, pumaFat) => {
    if (pumaMeat <= 0 || pumaEggs <= 0 || pumaFat <= 0) {
      alert("โปรดเติมต้นทุนของสินค้าก่อนคำนวณ");
      return;
    }

    return data.map((item) => ({
      ...item,
      cost:
        item.meatPuma * pumaMeat +
        item.eggsPuma * pumaEggs +
        item.fatPuma * pumaFat,
    }));
  };

  const calculateCostPowder = (
    data,
    powderMini,
    powderMedium,
    onionsMini,
    onionsMedium,
    sauce
  ) => {
    if (
      powderMini <= 0 ||
      powderMedium <= 0 ||
      onionsMini <= 0 ||
      onionsMedium <= 0 ||
      sauce <= 0
    ) {
      alert("โปรดเติมต้นทุนของสินค้าก่อนคำนวณ");
      return;
    }

    return data.map((item) => ({
      ...item,
      cost:
        item.powderMini * powderMini +
        item.powderMedium * powderMedium +
        item.onionsMini * onionsMini +
        item.onionsMedium * onionsMedium +
        item.sauce * sauce,
    }));
  };

  const handleSelectSkuType = (id) => {
    setSelected((prev) => (prev === id ? null : id));
  };

  const handleFileUpload = (e, setFileData) => {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onload = (event) => {
      const data = event.target.result;
      const workbook = XLSX.read(data, { type: "binary" });
      const workSheetNames = Object.keys(workbook.Sheets);
      const workSheetNamesToDelete = [
        "Reports",
        "Withdrawal records",
        "Fees explanation",
      ];

      workSheetNamesToDelete.forEach((sheetName) => {
        if (workSheetNames.includes(sheetName)) {
          // ลบ sheet ออกจาก workbook.Sheets
          delete workbook.Sheets[sheetName];

          // ลบชื่อ sheet ออกจาก workbook.SheetNames
          const indexToDelete = workbook.SheetNames.indexOf(sheetName);
          if (indexToDelete !== -1) {
            workbook.SheetNames.splice(indexToDelete, 1);
          }
        }
      });

      const firstSheetName = workbook.SheetNames[0];
      const worksheetCP = workbook.Sheets[firstSheetName];

      // แปลง sheet เป็น JSON
      const jsonData = XLSX.utils.sheet_to_json(worksheetCP);

      // ตั้งค่าข้อมูลที่แปลงแล้วไปยัง state
      setFileData(jsonData);
    };

    reader.readAsBinaryString(file);
  };

  const prepareFile1Data = (file1Data) => {
    // ดึงเฉพาะ sheet แรกมาใช้งาน
    const allSheets = Object.keys(file1Data);
    const firstSheet = file1Data[allSheets[0]];

    // ตรวจสอบและแก้ไขเซลล์ A1 เป็น "Order/adjustment ID"
    if (firstSheet[0] && firstSheet[0][0] !== "Order/adjustment ID") {
      firstSheet[0][0] = "Order/adjustment ID"; // แก้ไขเซลล์ A1
      console.log("แก้ไขหัวข้อคอลัมน์ A1 สำเร็จ");
    }

    // คืนค่า sheet ที่แก้ไขแล้ว
    return firstSheet;
  };

  const mergeData = () => {
    if (file1Data.length === 0 || file2Data.length === 0) {
      alert("กรุณาอัปโหลดไฟล์ทั้งสองไฟล์ก่อน!");
      return;
    }

    // พิมพ์ข้อมูลออกมาเพื่อตรวจสอบโครงสร้าง
    console.log("File1 Data:", file1Data);
    console.log("File2 Data:", file2Data);
    console.log("SKU Data:", skudata);

    const skuPumaUpdateCost = calculateCost(
      skudataPumaNew,
      pumaMeat,
      pumaEggs,
      pumaFat
    );

    const skuPowderUpdateCost = calculateCostPowder(
      skudataPowderNew,
      powderMini,
      powderMedium,
      onionsMini,
      onionsMedium,
      sauce
    );

    const preparedFile1Data = prepareFile1Data(file1Data);

    console.log("PrepareFile1", preparedFile1Data);

    // รวมข้อมูลที่ตรงกันเท่านั้น
    const merged = file2Data
      .map((row2) => {
        // ตรวจสอบว่า Order/adjustment ID และ Order ID มีข้อมูลหรือไม่
        const matchedRow = file1Data.find(
          (row1) =>
            String(row1["Order/adjustment ID"]) === String(row2["Order ID"])
        );

        if (!matchedRow) {
          console.log(`ไม่พบการจับคู่สำหรับ Order ID: ${row2["Order ID"]}`);
          return null; // ถ้าไม่พบการจับคู่ ให้คืนค่า null
        }

        // ตรวจสอบและจับคู่ SKU ID
        const skuMatched =
          selected === 3
            ? [
                ...skuPumaUpdateCost.filter(
                  (sku) => String(sku.skuID) === String(row2["SKU ID"])
                ),
                ...skuPowderUpdateCost.filter(
                  (sku) => String(sku.skuID) === String(row2["SKU ID"])
                ),
              ]
            : selected === 1
            ? skuPumaUpdateCost.find(
                (sku) => String(sku.skuID) === String(row2["SKU ID"])
              )
            : skuPowderUpdateCost.find(
                (sku) => String(sku.skuID) === String(row2["SKU ID"])
              );

        // ตรวจสอบว่า skuMatched มีค่าไหม
        if (
          !skuMatched ||
          (Array.isArray(skuMatched) && skuMatched.length === 0)
        ) {
          console.log(`ไม่พบการจับคู่สำหรับ SKU ID: ${row2["SKU ID"]}`);
          return null; // ถ้าไม่พบ SKU ก็ให้คืนค่า null
        }

        // ถ้า selected === 3 และพบหลายรายการใน skuMatched ให้ใช้ค่าแรกจากรายการ
        const skuCost = Array.isArray(skuMatched)
          ? skuMatched[0].cost
          : skuMatched.cost;

        // เพิ่มข้อมูล cost จาก skudata
        return {
          ...row2,
          "Total settlement amount": matchedRow["Total settlement amount"],
          Cost: skuCost, // เพิ่ม cost จาก skudata
        };
      })
      .filter((result) => result !== null); // กรองค่าที่เป็น null ออก

    // รวมข้อมูล Order ID ที่ซ้ำกัน โดยรวม SKU และ Cost ตาม Order ID
    const reducedData = merged.reduce((acc, row) => {
      const existingOrder = acc.find(
        (item) => item["Order ID"] === row["Order ID"]
      );

      if (existingOrder) {
        // หากมี Order ID เดียวกัน ให้รวม SKU ID และ Cost
        existingOrder["SKU ID"] += `, ${row["SKU ID"]}`;
        existingOrder["Cost"] += row.Cost; // รวมค่า Cost ของแต่ละ SKU
      } else {
        // ถ้าไม่พบ Order ID ใน acc ให้เพิ่มแถวใหม่
        acc.push({ ...row });
      }

      return acc;
    }, []);

    // ตรวจสอบผลลัพธ์ที่รวมแล้ว
    console.log("Merged and Reduced Data:", reducedData);
    setMergedData(reducedData);
  };

  const totalNet = mergedData.reduce((acc, row) => {
    // คำนวณผลรวมสำหรับแต่ละแถว
    const rowTotal = parseFloat(
      row["Total settlement amount"] -
        row["Cost"] * row["Quantity"] -
        adsCost / mergedData.length
    ).toFixed(2);

    // รวมผลรวมแต่ละแถวเข้าไปใน accumulator (acc)
    return acc + parseFloat(rowTotal);
  }, 0);

  const totalVat = mergedData
    .reduce((acc, row) => {
      // คำนวณผลรวมสำหรับแต่ละแถว
      const rowTotal = row["Total settlement amount"] * (7 / 100);

      // รวมผลรวมแต่ละแถวเข้าไปใน accumulator (acc)
      return acc + rowTotal;
    }, 0)
    .toFixed(2);

  console.log(selected);

  return (
    <div className="relative overflow-x-auto overflow-y-auto">
      <div className="flex justify-center items-center mt-5">
        <h1 className="text-2xl font-bold">ระบบคำนวณรายได้จาก TikTok</h1>
      </div>

      <div className=" flex justify-center items-center mt-9 mb-9">
        {options.map((option) => (
          <label
            key={option.id}
            style={{
              display: "block",
              marginBottom: "8px",
              marginRight: "20px",
            }}
          >
            <input
              type="checkbox"
              checked={selected === option.id}
              onChange={() => handleSelectSkuType(option.id)}
            />
            {option.label}
          </label>
        ))}
      </div>

      <div className=" flex flex-col justify-center items-center mt-9 mb-9">
        <h2 className="mb-3">ต้นทุนสินค้า</h2>
        <div className="grid grid-cols-2 gap-5">
          <div className="border border-black rounded-lg p-10">
            <div className=" flex justify-between ">
              <h3 className="mr-3">น้ำพริกเนื้อปู : </h3>
              <input
                placeholder="ป้อนต้นทุนน้ำพริกเนื้อปู"
                value={pumaMeat}
                type="number"
                onChange={(e) => {
                  setPumaMeat(e.target.value);
                }}
                className="border w-[100px] rounded-lg "
              />
            </div>
            <div className="mt-2 flex justify-between ">
              <h3 className="mr-3">น้ำพริกไข่ปู : </h3>
              <input
                placeholder="ป้อนต้นทุนน้ำพริกเนื้อปู"
                value={pumaEggs}
                type="number"
                onChange={(e) => {
                  setPumaEggs(e.target.value);
                }}
                className="border w-[100px] rounded-lg "
              />
            </div>
            <div className="mt-2 flex justify-between ">
              <h3 className="mr-3">น้ำพริกมันปู : </h3>
              <input
                placeholder="ป้อนต้นทุนน้ำพริกเนื้อปู"
                value={pumaFat}
                type="number"
                onChange={(e) => {
                  setPumaFat(e.target.value);
                }}
                className="border w-[100px] rounded-lg "
              />
            </div>
          </div>
          <div className="border border-black rounded-lg p-10">
            <div className=" flex justify-between ">
              <h3 className="mr-3">แป้งหมักไก่ 120G : </h3>
              <input
                placeholder="ป้อนต้นทุนน้ำพริกเนื้อปู"
                value={powderMini}
                type="number"
                onChange={(e) => {
                  setPowderMini(e.target.value);
                }}
                className="border w-[100px] rounded-lg "
              />
            </div>
            <div className="mt-2 flex justify-between ">
              <h3 className="mr-3">แป้งหมักไก่ 0.5KG : </h3>
              <input
                placeholder="ป้อนต้นทุนน้ำพริกเนื้อปู"
                value={powderMedium}
                type="number"
                onChange={(e) => {
                  setPowderMedium(e.target.value);
                }}
                className="border w-[100px] rounded-lg "
              />
            </div>
            <div className="mt-2 flex justify-between ">
              <h3 className="mr-3">หอมเจียว 100G : </h3>
              <input
                placeholder="ป้อนต้นทุนน้ำพริกเนื้อปู"
                value={onionsMini}
                type="number"
                onChange={(e) => {
                  setOnionsMini(e.target.value);
                }}
                className="border w-[100px] rounded-lg "
              />
            </div>
            <div className="mt-2 flex justify-between ">
              <h3 className="mr-3">หอมเจียว 500G : </h3>
              <input
                placeholder="ป้อนต้นทุนน้ำพริกเนื้อปู"
                value={onionsMedium}
                type="number"
                onChange={(e) => {
                  setOnionsMedium(e.target.value);
                }}
                className="border w-[100px] rounded-lg "
              />
            </div>
            <div className="mt-2 flex justify-between ">
              <h3 className="mr-3">น้ำจิ้มไก่ : </h3>
              <input
                placeholder="ป้อนต้นทุนน้ำพริกเนื้อปู"
                value={sauce}
                type="number"
                onChange={(e) => {
                  setSauce(e.target.value);
                }}
                className="border w-[100px] rounded-lg "
              />
            </div>
          </div>
        </div>
      </div>

      <div className=" flex justify-center items-center mt-9 mb-9">
        <div className="flex-col items-center justify-center">
          <h2 className="mb-9">อัพโหลดไฟล์จากการเงิน TikTok</h2>
          <input
            type="file"
            accept=".xlsx, .xls"
            onChange={(e) => handleFileUpload(e, setFile1Data)}
          />
        </div>
        <div className="flex-col items-center justify-center">
          <h2 className="mb-9">อัพโหลดไฟล์จากคำสั่งซื้อ TikTok</h2>
          <input
            type="file"
            accept=".xlsx, .xls"
            onChange={(e) => handleFileUpload(e, setFile2Data)}
          />
        </div>
      </div>

      <div className="flex justify-center items-center">
        <button
          className="bg-slate-500 text-white p-2 rounded-lg hover:bg-slate-400"
          onClick={() => {
            mergeData();
          }}
        >
          คำนวณข้อมูล
        </button>
      </div>

      <div className="flex justify-center items-center mt-5 text-xl">
        จำนวนออเดอร์ทั้งหมด {mergedData.length} ออเดอร์
      </div>
      <div className="flex flex-col justify-center items-center mt-5 text-xl">
        <h2 className="mb-2">ค่าโฆษณา ฿</h2>
        <input
          placeholder="ป้อนค่าโฆษณา"
          value={adsCost}
          type="number"
          onChange={(e) => {
            setAdsCost(e.target.value);
          }}
          className=" border "
        />
      </div>
      <div className="flex flex-col justify-center items-center mt-5 text-xl">
        <h2 className="mb-2">ค่ากล่อง+ค่าแพ็ค ฿</h2>
        <input
          placeholder="ค่ากล่อง+ค่าแพ็ค"
          value={boxCost}
          type="number"
          onChange={(e) => {
            setBoxCost(e.target.value);
          }}
          className=" border "
        />
      </div>
      <div className="flex justify-center items-center">
        <div className="flex flex-col justify-center items-center mt-5 mr-[200px] text-xl">
          <h2 className="mb-2 ">กำไรสุทธิ ฿</h2>
          <h2
            className="mb-5 text-2xl"
            style={{ color: totalNet < 1 ? "red" : "green" }}
          >
            {Number(parseFloat(totalNet - boxCost).toFixed(2)).toLocaleString(
              "en-US"
            )}
          </h2>
        </div>
        <div className="flex flex-col justify-center items-center mt-5 text-xl">
          <h2 className="mb-2 ">ค่าภาษี Vat 7% ฿</h2>
          <h2 className="mb-5 text-2xl" style={{ color: "red" }}>
            {Number(parseFloat(totalVat).toFixed(2)).toLocaleString("en-US")}
          </h2>
        </div>
      </div>

      <div className="relative overflow-x-auto overflow-y-auto">
        {mergedData.length > 0 && (
          <table className="w-full text-sm text-left rtl:text-right text-gray-500 ">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 ">
              <tr>
                {/* {Object.keys(data[0]).map((key) => (
                  <th className="px-6 py-3" key={key}>
                    {key}
                  </th>
                ))} */}
                <th className="px-6 py-3">Order ID</th>
                <th className="px-6 py-3">SKU ID</th>
                <th className="px-1 py-3">Product Name</th>
                <th className="px-1 py-3">Quantity</th>
                <th className="px-6 py-3">Total Revenue ฿</th>
                <th className="px-6 py-3">Total Net ฿</th>
                <th className="px-6 py-3">Cost ฿</th>
              </tr>
            </thead>
            <tbody>
              {mergedData.map((row, index) => (
                <tr className="bg-white border-b" key={index}>
                  <td className="px-6 py-4">{row["Order ID"]}</td>
                  <td className="px-6 py-4">{row["SKU ID"]}</td>
                  <td className="px-1 py-4">{row["Variation"]}</td>
                  <td className="px-1 py-4">{row["Quantity"]}</td>
                  <td className="px-6 py-4">
                    {row["Total settlement amount"]}
                  </td>
                  <td
                    className="px-6 py-4"
                    style={{
                      color:
                        row["Total settlement amount"] -
                          row["Cost"] * row["Quantity"] -
                          adsCost / mergedData.length <
                        0
                          ? "red"
                          : "green",
                    }}
                  >
                    {parseFloat(
                      row["Total settlement amount"] -
                        row["Cost"] * row["Quantity"] -
                        adsCost / mergedData.length
                    ).toFixed(2)}
                  </td>
                  <td className="px-6 py-4">{row["Cost"]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
