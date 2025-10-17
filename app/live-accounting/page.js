"use client";

import { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import skudata from "@/app/skudata.json";

export default function EmployeePage() {
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
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  // SKU Form states
  const [showPumaForm, setShowPumaForm] = useState(false);
  const [showPowderForm, setShowPowderForm] = useState(false);
  const [pumaFormData, setPumaFormData] = useState({
    skuID: "",
    productName: "",
    meatPuma: 0,
    eggsPuma: 0,
    fatPuma: 0,
  });
  const [powderFormData, setPowderFormData] = useState({
    skuID: "",
    productName: "",
    powderMini: 0,
    powderMedium: 0,
    onionsMini: 0,
    onionsMedium: 0,
    sauce: 0,
  });

  // Load data from localStorage on component mount
  useEffect(() => {
    const savedPumaData = localStorage.getItem("skudataPumaNew");
    const savedPowderData = localStorage.getItem("skudataPowderNew");

    if (savedPumaData) {
      try {
        setSkudataPumaNew(JSON.parse(savedPumaData));
      } catch (error) {
        console.error("Error parsing saved Puma data:", error);
      }
    }

    if (savedPowderData) {
      try {
        setSkudataPowderNew(JSON.parse(savedPowderData));
      } catch (error) {
        console.error("Error parsing saved Powder data:", error);
      }
    }

    setIsDataLoaded(true);
  }, []);

  // Save to localStorage whenever data changes (only after initial load)
  useEffect(() => {
    if (isDataLoaded) {
      localStorage.setItem("skudataPumaNew", JSON.stringify(skudataPumaNew));
    }
  }, [skudataPumaNew, isDataLoaded]);

  useEffect(() => {
    if (isDataLoaded) {
      localStorage.setItem(
        "skudataPowderNew",
        JSON.stringify(skudataPowderNew)
      );
    }
  }, [skudataPowderNew, isDataLoaded]);

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
          delete workbook.Sheets[sheetName];
          const indexToDelete = workbook.SheetNames.indexOf(sheetName);
          if (indexToDelete !== -1) {
            workbook.SheetNames.splice(indexToDelete, 1);
          }
        }
      });

      const firstSheetName = workbook.SheetNames[0];
      const worksheetCP = workbook.Sheets[firstSheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheetCP);
      setFileData(jsonData);
    };

    reader.readAsBinaryString(file);
  };

  const prepareFile1Data = (file1Data) => {
    const allSheets = Object.keys(file1Data);
    const firstSheet = file1Data[allSheets[0]];

    if (firstSheet[0] && firstSheet[0][0] !== "Order/adjustment ID") {
      firstSheet[0][0] = "Order/adjustment ID";
      console.log("แก้ไขหัวข้อคอลัมน์ A1 สำเร็จ");
    }

    return firstSheet;
  };

  const mergeData = () => {
    if (file1Data.length === 0 || file2Data.length === 0) {
      alert("กรุณาอัปโหลดไฟล์ทั้งสองไฟล์ก่อน!");
      return;
    }

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

    const merged = file2Data
      .map((row2) => {
        const matchedRow = file1Data.find(
          (row1) =>
            String(row1["Order/adjustment ID"]) === String(row2["Order ID"])
        );

        if (!matchedRow) {
          console.log(`ไม่พบการจับคู่สำหรับ Order ID: ${row2["Order ID"]}`);
          return null;
        }

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

        if (
          !skuMatched ||
          (Array.isArray(skuMatched) && skuMatched.length === 0)
        ) {
          console.log(`ไม่พบการจับคู่สำหรับ SKU ID: ${row2["SKU ID"]}`);
          return null;
        }

        const skuCost = Array.isArray(skuMatched)
          ? skuMatched[0].cost
          : skuMatched.cost;

        return {
          ...row2,
          "Total settlement amount": matchedRow["Total settlement amount"],
          Cost: skuCost,
        };
      })
      .filter((result) => result !== null);

    const reducedData = merged.reduce((acc, row) => {
      const existingOrder = acc.find(
        (item) => item["Order ID"] === row["Order ID"]
      );

      if (existingOrder) {
        existingOrder["SKU ID"] += `, ${row["SKU ID"]}`;
        existingOrder["Cost"] += row.Cost;
      } else {
        acc.push({ ...row });
      }

      return acc;
    }, []);

    console.log("Merged and Reduced Data:", reducedData);
    setMergedData(reducedData);
  };

  // Add Puma SKU
  const handleAddPumaSku = () => {
    if (!pumaFormData.skuID || !pumaFormData.productName) {
      alert("กรุณากรอกข้อมูล SKU ID และชื่อสินค้า");
      return;
    }

    const newSku = {
      skuID: pumaFormData.skuID,
      productName: pumaFormData.productName,
      meatPuma: Number(pumaFormData.meatPuma),
      eggsPuma: Number(pumaFormData.eggsPuma),
      fatPuma: Number(pumaFormData.fatPuma),
    };

    setSkudataPumaNew([...skudataPumaNew, newSku]);
    setPumaFormData({
      skuID: "",
      productName: "",
      meatPuma: 0,
      eggsPuma: 0,
      fatPuma: 0,
    });
    setShowPumaForm(false);
  };

  // Add Powder SKU
  const handleAddPowderSku = () => {
    if (!powderFormData.skuID || !powderFormData.productName) {
      alert("กรุณากรอกข้อมูล SKU ID และชื่อสินค้า");
      return;
    }

    const newSku = {
      skuID: powderFormData.skuID,
      productName: powderFormData.productName,
      powderMini: Number(powderFormData.powderMini),
      powderMedium: Number(powderFormData.powderMedium),
      onionsMini: Number(powderFormData.onionsMini),
      onionsMedium: Number(powderFormData.onionsMedium),
      sauce: Number(powderFormData.sauce),
    };

    setSkudataPowderNew([...skudataPowderNew, newSku]);
    setPowderFormData({
      skuID: "",
      productName: "",
      powderMini: 0,
      powderMedium: 0,
      onionsMini: 0,
      onionsMedium: 0,
      sauce: 0,
    });
    setShowPowderForm(false);
  };

  // Delete SKU functions
  const deletePumaSku = (index) => {
    const updatedData = skudataPumaNew.filter((_, i) => i !== index);
    setSkudataPumaNew(updatedData);
  };

  const deletePowderSku = (index) => {
    const updatedData = skudataPowderNew.filter((_, i) => i !== index);
    setSkudataPowderNew(updatedData);
  };

  const totalNet = mergedData.reduce((acc, row) => {
    const rowTotal = parseFloat(
      row["Total settlement amount"] -
        row["Cost"] * row["Quantity"] -
        adsCost / mergedData.length
    ).toFixed(2);

    return acc + parseFloat(rowTotal);
  }, 0);

  const totalVat = mergedData
    .reduce((acc, row) => {
      const rowTotal = row["Total settlement amount"] * (7 / 100);
      return acc + rowTotal;
    }, 0)
    .toFixed(2);

  console.log(selected);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
            ระบบคำนวณรายได้จาก TikTok (Employee)
          </h1>
          <p className="text-gray-600">
            ระบบจัดการและคำนวณกำไรจากการขายผ่าน TikTok Shop สำหรับพนักงาน
          </p>
        </div>

        {/* SKU Management Section */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8 border border-gray-200">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              จัดการข้อมูล SKU
            </h2>
            <p className="text-gray-600">
              เพิ่มและจัดการข้อมูล SKU สำหรับการคำนวณต้นทุน
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Puma SKU Management */}
            <div className="bg-gradient-to-br from-orange-50 to-red-50 border-2 border-orange-200 rounded-xl p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-orange-800">
                  น้ำพริกปูม้า SKU
                </h3>
                <button
                  onClick={() => setShowPumaForm(!showPumaForm)}
                  className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  เพิ่ม SKU
                </button>
              </div>

              {showPumaForm && (
                <div className="bg-white rounded-lg p-4 mb-4 border border-orange-300">
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <input
                      type="text"
                      placeholder="SKU ID"
                      value={pumaFormData.skuID}
                      onChange={(e) =>
                        setPumaFormData({
                          ...pumaFormData,
                          skuID: e.target.value,
                        })
                      }
                      className="border rounded-lg px-3 py-2"
                    />
                    <input
                      type="text"
                      placeholder="ชื่อสินค้า"
                      value={pumaFormData.productName}
                      onChange={(e) =>
                        setPumaFormData({
                          ...pumaFormData,
                          productName: e.target.value,
                        })
                      }
                      className="border rounded-lg px-3 py-2"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-3 mb-3">
                    <input
                      type="number"
                      placeholder="เนื้อปู"
                      value={pumaFormData.meatPuma}
                      onChange={(e) =>
                        setPumaFormData({
                          ...pumaFormData,
                          meatPuma: e.target.value,
                        })
                      }
                      className="border rounded-lg px-3 py-2"
                    />
                    <input
                      type="number"
                      placeholder="ไข่ปู"
                      value={pumaFormData.eggsPuma}
                      onChange={(e) =>
                        setPumaFormData({
                          ...pumaFormData,
                          eggsPuma: e.target.value,
                        })
                      }
                      className="border rounded-lg px-3 py-2"
                    />
                    <input
                      type="number"
                      placeholder="มันปู"
                      value={pumaFormData.fatPuma}
                      onChange={(e) =>
                        setPumaFormData({
                          ...pumaFormData,
                          fatPuma: e.target.value,
                        })
                      }
                      className="border rounded-lg px-3 py-2"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleAddPumaSku}
                      className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex-1"
                    >
                      เพิ่ม
                    </button>
                    <button
                      onClick={() => setShowPumaForm(false)}
                      className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg flex-1"
                    >
                      ยกเลิก
                    </button>
                  </div>
                </div>
              )}

              <div className="max-h-60 overflow-y-auto">
                {skudataPumaNew.map((item, index) => (
                  <div
                    key={index}
                    className="bg-white rounded-lg p-3 mb-2 border border-orange-200"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold text-gray-800">
                          {item.skuID}
                        </p>
                        <p className="text-sm text-gray-600">
                          {item.productName}
                        </p>
                        <p className="text-xs text-gray-500">
                          เนื้อปู: {item.meatPuma} | ไข่ปู: {item.eggsPuma} |
                          มันปู: {item.fatPuma}
                        </p>
                      </div>
                      <button
                        onClick={() => deletePumaSku(index)}
                        className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-sm"
                      >
                        ลบ
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Powder SKU Management */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-green-800">
                  แป้งหมักไก่ SKU
                </h3>
                <button
                  onClick={() => setShowPowderForm(!showPowderForm)}
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  เพิ่ม SKU
                </button>
              </div>

              {showPowderForm && (
                <div className="bg-white rounded-lg p-4 mb-4 border border-green-300">
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <input
                      type="text"
                      placeholder="SKU ID"
                      value={powderFormData.skuID}
                      onChange={(e) =>
                        setPowderFormData({
                          ...powderFormData,
                          skuID: e.target.value,
                        })
                      }
                      className="border rounded-lg px-3 py-2"
                    />
                    <input
                      type="text"
                      placeholder="ชื่อสินค้า"
                      value={powderFormData.productName}
                      onChange={(e) =>
                        setPowderFormData({
                          ...powderFormData,
                          productName: e.target.value,
                        })
                      }
                      className="border rounded-lg px-3 py-2"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <input
                      type="number"
                      placeholder="แป้ง 120G"
                      value={powderFormData.powderMini}
                      onChange={(e) =>
                        setPowderFormData({
                          ...powderFormData,
                          powderMini: e.target.value,
                        })
                      }
                      className="border rounded-lg px-3 py-2"
                    />
                    <input
                      type="number"
                      placeholder="แป้ง 0.5KG"
                      value={powderFormData.powderMedium}
                      onChange={(e) =>
                        setPowderFormData({
                          ...powderFormData,
                          powderMedium: e.target.value,
                        })
                      }
                      className="border rounded-lg px-3 py-2"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-3 mb-3">
                    <input
                      type="number"
                      placeholder="หอม 100G"
                      value={powderFormData.onionsMini}
                      onChange={(e) =>
                        setPowderFormData({
                          ...powderFormData,
                          onionsMini: e.target.value,
                        })
                      }
                      className="border rounded-lg px-3 py-2"
                    />
                    <input
                      type="number"
                      placeholder="หอม 500G"
                      value={powderFormData.onionsMedium}
                      onChange={(e) =>
                        setPowderFormData({
                          ...powderFormData,
                          onionsMedium: e.target.value,
                        })
                      }
                      className="border rounded-lg px-3 py-2"
                    />
                    <input
                      type="number"
                      placeholder="น้ำจิ้มไก่"
                      value={powderFormData.sauce}
                      onChange={(e) =>
                        setPowderFormData({
                          ...powderFormData,
                          sauce: e.target.value,
                        })
                      }
                      className="border rounded-lg px-3 py-2"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleAddPowderSku}
                      className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex-1"
                    >
                      เพิ่ม
                    </button>
                    <button
                      onClick={() => setShowPowderForm(false)}
                      className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg flex-1"
                    >
                      ยกเลิก
                    </button>
                  </div>
                </div>
              )}

              <div className="max-h-60 overflow-y-auto">
                {skudataPowderNew.map((item, index) => (
                  <div
                    key={index}
                    className="bg-white rounded-lg p-3 mb-2 border border-green-200"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold text-gray-800">
                          {item.skuID}
                        </p>
                        <p className="text-sm text-gray-600">
                          {item.productName}
                        </p>
                        <p className="text-xs text-gray-500">
                          แป้ง 120G:{item.powderMini} | แป้ง 0.5KG:
                          {item.powderMedium} | หอม 100G:{item.onionsMini} | หอม
                          500G:{item.onionsMedium} | น้ำจิ้มไก่:{item.sauce}
                        </p>
                      </div>
                      <button
                        onClick={() => deletePowderSku(index)}
                        className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-sm"
                      >
                        ลบ
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-center items-center mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 text-center">
              เลือกประเภทสินค้า
            </h2>
            <div className="flex gap-6">
              {options.map((option) => (
                <label
                  key={option.id}
                  className="flex items-center space-x-3 cursor-pointer group"
                >
                  <input
                    type="checkbox"
                    checked={selected === option.id}
                    onChange={() => handleSelectSkuType(option.id)}
                    className="w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 focus:ring-2"
                  />
                  <span className="text-gray-700 group-hover:text-indigo-600 transition-colors duration-200 font-medium">
                    {option.label}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8 mb-8 border border-gray-200">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              ต้นทุนสินค้า
            </h2>
            <p className="text-gray-600">
              กรอกต้นทุนของแต่ละประเภทสินค้าเพื่อคำนวณกำไร
            </p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-gradient-to-br from-orange-50 to-red-50 border-2 border-orange-200 rounded-xl p-6">
              <h3 className="text-xl font-bold text-orange-800 mb-6 text-center">
                น้ำพริกปูม้า
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="text-gray-700 font-medium">
                    น้ำพริกเนื้อปู :
                  </label>
                  <input
                    placeholder="ต้นทุน (บาท)"
                    value={pumaMeat}
                    type="number"
                    onChange={(e) => {
                      setPumaMeat(e.target.value);
                    }}
                    className="border border-gray-300 rounded-lg px-3 py-2 w-32 focus:ring-2 focus:ring-orange-400 focus:border-orange-400 outline-none transition-all"
                  />
                </div>
                <div className="flex justify-between items-center">
                  <label className="text-gray-700 font-medium">
                    น้ำพริกไข่ปู :
                  </label>
                  <input
                    placeholder="ต้นทุน (บาท)"
                    value={pumaEggs}
                    type="number"
                    onChange={(e) => {
                      setPumaEggs(e.target.value);
                    }}
                    className="border border-gray-300 rounded-lg px-3 py-2 w-32 focus:ring-2 focus:ring-orange-400 focus:border-orange-400 outline-none transition-all"
                  />
                </div>
                <div className="flex justify-between items-center">
                  <label className="text-gray-700 font-medium">
                    น้ำพริกมันปู :
                  </label>
                  <input
                    placeholder="ต้นทุน (บาท)"
                    value={pumaFat}
                    type="number"
                    onChange={(e) => {
                      setPumaFat(e.target.value);
                    }}
                    className="border border-gray-300 rounded-lg px-3 py-2 w-32 focus:ring-2 focus:ring-orange-400 focus:border-orange-400 outline-none transition-all"
                  />
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-6">
              <h3 className="text-xl font-bold text-green-800 mb-6 text-center">
                แป้งหมักไก่
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="text-gray-700 font-medium">
                    แป้งหมักไก่ 120G :
                  </label>
                  <input
                    placeholder="ต้นทุน (บาท)"
                    value={powderMini}
                    type="number"
                    onChange={(e) => {
                      setPowderMini(e.target.value);
                    }}
                    className="border border-gray-300 rounded-lg px-3 py-2 w-32 focus:ring-2 focus:ring-green-400 focus:border-green-400 outline-none transition-all"
                  />
                </div>
                <div className="flex justify-between items-center">
                  <label className="text-gray-700 font-medium">
                    แป้งหมักไก่ 0.5KG :
                  </label>
                  <input
                    placeholder="ต้นทุน (บาท)"
                    value={powderMedium}
                    type="number"
                    onChange={(e) => {
                      setPowderMedium(e.target.value);
                    }}
                    className="border border-gray-300 rounded-lg px-3 py-2 w-32 focus:ring-2 focus:ring-green-400 focus:border-green-400 outline-none transition-all"
                  />
                </div>
                <div className="flex justify-between items-center">
                  <label className="text-gray-700 font-medium">
                    หอมเจียว 100G :
                  </label>
                  <input
                    placeholder="ต้นทุน (บาท)"
                    value={onionsMini}
                    type="number"
                    onChange={(e) => {
                      setOnionsMini(e.target.value);
                    }}
                    className="border border-gray-300 rounded-lg px-3 py-2 w-32 focus:ring-2 focus:ring-green-400 focus:border-green-400 outline-none transition-all"
                  />
                </div>
                <div className="flex justify-between items-center">
                  <label className="text-gray-700 font-medium">
                    หอมเจียว 500G :
                  </label>
                  <input
                    placeholder="ต้นทุน (บาท)"
                    value={onionsMedium}
                    type="number"
                    onChange={(e) => {
                      setOnionsMedium(e.target.value);
                    }}
                    className="border border-gray-300 rounded-lg px-3 py-2 w-32 focus:ring-2 focus:ring-green-400 focus:border-green-400 outline-none transition-all"
                  />
                </div>
                <div className="flex justify-between items-center">
                  <label className="text-gray-700 font-medium">
                    น้ำจิ้มไก่ :
                  </label>
                  <input
                    placeholder="ต้นทุน (บาท)"
                    value={sauce}
                    type="number"
                    onChange={(e) => {
                      setSauce(e.target.value);
                    }}
                    className="border border-gray-300 rounded-lg px-3 py-2 w-32 focus:ring-2 focus:ring-green-400 focus:border-green-400 outline-none transition-all"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8 mb-8 border border-gray-200">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              อัพโหลดไฟล์ข้อมูล
            </h2>
            <p className="text-gray-600">
              อัพโหลดไฟล์ Excel จาก TikTok เพื่อประมวลผลข้อมูล
            </p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-6 text-center">
              <div className="mb-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg
                    className="w-8 h-8 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    ></path>
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-blue-800 mb-2">
                  ไฟล์จากการเงิน TikTok
                </h3>
              </div>
              <input
                type="file"
                accept=".xlsx, .xls"
                onChange={(e) => handleFileUpload(e, setFile1Data)}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 file:cursor-pointer cursor-pointer"
              />
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl p-6 text-center">
              <div className="mb-4">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg
                    className="w-8 h-8 text-purple-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                    ></path>
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-purple-800 mb-2">
                  ไฟล์จากคำสั่งซื้อ TikTok
                </h3>
              </div>
              <input
                type="file"
                accept=".xlsx, .xls"
                onChange={(e) => handleFileUpload(e, setFile2Data)}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100 file:cursor-pointer cursor-pointer"
              />
            </div>
          </div>
        </div>

        <div className="text-center mb-8">
          <button
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold py-4 px-8 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
            onClick={() => {
              mergeData();
            }}
          >
            <svg
              className="w-5 h-5 mr-2 inline"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
              ></path>
            </svg>
            คำนวณข้อมูล
          </button>
        </div>

        {mergedData.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-gray-200">
            <div className="text-center mb-6">
              <div className="inline-flex items-center bg-green-100 text-green-800 px-4 py-2 rounded-full font-semibold">
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  ></path>
                </svg>
                จำนวนออเดอร์ทั้งหมด {mergedData.length} ออเดอร์
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-6">
              <div className="bg-gradient-to-br from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl p-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ค่าโฆษณา (฿)
                </label>
                <input
                  placeholder="ป้อนค่าโฆษณา"
                  value={adsCost}
                  type="number"
                  onChange={(e) => {
                    setAdsCost(e.target.value);
                  }}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 outline-none"
                />
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200 rounded-xl p-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ค่ากล่อง+ค่าแพ็ค (฿)
                </label>
                <input
                  placeholder="ค่ากล่อง+ค่าแพ็ค"
                  value={boxCost}
                  type="number"
                  onChange={(e) => {
                    setBoxCost(e.target.value);
                  }}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none"
                />
              </div>

              <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4 text-center">
                <h3 className="text-sm font-medium text-gray-700 mb-2">
                  กำไรสุทธิ (฿)
                </h3>
                <div
                  className="text-2xl font-bold"
                  style={{ color: totalNet < 1 ? "#ef4444" : "#22c55e" }}
                >
                  {Number(
                    parseFloat(totalNet - boxCost).toFixed(2)
                  ).toLocaleString("en-US")}
                </div>
              </div>

              <div className="bg-gradient-to-br from-red-50 to-pink-50 border border-red-200 rounded-xl p-4 text-center">
                <h3 className="text-sm font-medium text-gray-700 mb-2">
                  ค่าภาษี VAT 7% (฿)
                </h3>
                <div className="text-2xl font-bold text-red-600">
                  {Number(parseFloat(totalVat).toFixed(2)).toLocaleString(
                    "en-US"
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
          {mergedData.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-gray-700 uppercase bg-gradient-to-r from-gray-50 to-gray-100">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Order ID</th>
                    <th className="px-6 py-4 font-semibold">SKU ID</th>
                    <th className="px-4 py-4 font-semibold">Product Name</th>
                    <th className="px-4 py-4 font-semibold">Quantity</th>
                    <th className="px-6 py-4 font-semibold">Total Revenue ฿</th>
                    <th className="px-6 py-4 font-semibold">Total Net ฿</th>
                    <th className="px-6 py-4 font-semibold">Cost ฿</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {mergedData.map((row, index) => (
                    <tr
                      className="bg-white hover:bg-gray-50 transition-colors duration-200"
                      key={index}
                    >
                      <td className="px-6 py-4 font-medium text-gray-900">
                        {row["Order ID"]}
                      </td>
                      <td className="px-6 py-4 text-gray-700">
                        {row["SKU ID"]}
                      </td>
                      <td className="px-4 py-4 text-gray-700">
                        {row["Variation"]}
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {row["Quantity"]}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-semibold text-green-600">
                        ฿
                        {Number(row["Total settlement amount"]).toLocaleString(
                          "en-US"
                        )}
                      </td>
                      <td
                        className="px-6 py-4 font-bold"
                        style={{
                          color:
                            row["Total settlement amount"] -
                              row["Cost"] * row["Quantity"] -
                              adsCost / mergedData.length <
                            0
                              ? "#ef4444"
                              : "#22c55e",
                        }}
                      >
                        ฿
                        {parseFloat(
                          row["Total settlement amount"] -
                            row["Cost"] * row["Quantity"] -
                            adsCost / mergedData.length
                        ).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-gray-700">
                        ฿{row["Cost"]}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
