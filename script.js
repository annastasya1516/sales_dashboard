/**
 * Sales Dashboard 2023
 * ─────────────────────────────────────────────────────────────
 * Data CSV di-embed langsung sebagai string constant sehingga
 * dashboard bisa dibuka cukup dengan double-click index.html
 * tanpa perlu web server (menghindari CORS error pada file://).
 *
 * Arsitektur:
 *  1. CSV_RAW   — data mentah sebagai template literal
 *  2. parseCSV  — parser CSV → array of objects
 *  3. Filter    — populate dropdown + apply filter
 *  4. KPI       — hitung & tampilkan 4 metrik utama
 *  5. Charts    — 10 fungsi render individual (Chart.js)
 *  6. init()    — bootstrap semua komponen
 */

"use strict";

// ─── 1. DATA CSV (EMBEDDED) ──────────────────────────────────
// Seluruh isi 200_sales_data.csv disimpan di sini agar dashboard
// berjalan tanpa fetch() / web server.
const CSV_RAW = `Product_ID,Sale_Date,Sales_Rep,Region,Sales_Amount,Quantity_Sold,Product_Category,Unit_Cost,Unit_Price,Customer_Type,Discount,Payment_Method,Sales_Channel,Region_and_Sales_Rep
1088,2023-11-16,Eve,North,8518.45,13,Furniture,2440.11,2517.6,New,0.23,Bank Transfer,Retail,North-Eve
1021,2023-11-27,Alice,South,6483.84,31,Furniture,2254.99,2441.79,Returning,0.24,Bank Transfer,Online,South-Alice
1076,2023-12-16,Eve,East,7160.75,30,Clothing,3519.63,3774.65,New,0.2,Credit Card,Retail,East-Eve
1091,2023-09-04,Charlie,South,675.11,44,Food,2085.46,2406.58,Returning,0.06,Bank Transfer,Retail,South-Charlie
1047,2023-08-08,David,North,1331.25,33,Electronics,1341.55,1427.21,Returning,0.15,Credit Card,Online,North-David
1003,2023-04-28,Charlie,South,5991.8,27,Furniture,623.32,853.66,Returning,0.04,Cash,Online,South-Charlie
1014,2023-11-22,David,West,9762.54,17,Food,3184.65,3204.01,New,0.2,Bank Transfer,Online,West-David
1009,2023-04-28,Alice,North,1342.95,33,Clothing,2278.9,2626.9,New,0.05,Credit Card,Online,North-Alice
1084,2023-08-13,Alice,West,1290.05,21,Furniture,3497.98,3765.31,New,0.08,Cash,Online,West-Alice
1092,2023-01-20,Charlie,East,2729.27,40,Electronics,4624.16,4731.98,New,0.2,Bank Transfer,Retail,East-Charlie
1044,2023-02-16,David,South,7754.1,22,Food,3373.46,3454.76,Returning,0.22,Bank Transfer,Retail,South-David
1035,2023-05-22,Alice,South,3780.22,45,Food,4132.79,4624.1,New,0.15,Credit Card,Retail,South-Alice
1078,2023-11-16,David,East,113.4,8,Furniture,3459.61,3657.23,Returning,0.03,Bank Transfer,Online,East-David
1050,2023-05-19,Charlie,East,9744.52,35,Clothing,2158.69,2384.38,Returning,0.09,Bank Transfer,Retail,East-Charlie
1002,2023-11-29,David,North,333.59,24,Furniture,3305.94,3599.27,New,0.09,Credit Card,Retail,North-David
1054,2023-01-10,Eve,South,4634.16,40,Furniture,2654.11,2929.32,Returning,0.08,Cash,Online,South-Eve
1063,2023-05-18,Bob,West,3098.87,39,Food,3577.69,3931.25,Returning,0.21,Cash,Retail,West-Bob
1014,2023-04-11,Alice,South,9582.12,38,Food,2091.21,2527.0,Returning,0.01,Credit Card,Online,South-Alice
1048,2023-09-30,Charlie,North,7873.38,4,Furniture,2900.14,2910.51,New,0.22,Credit Card,Retail,North-Charlie
1080,2023-08-24,Bob,West,1493.95,17,Furniture,2742.67,2979.64,Returning,0.01,Cash,Retail,West-Bob
1089,2023-01-01,Charlie,North,8130.13,35,Clothing,4071.01,4304.7,New,0.14,Credit Card,Online,North-Charlie
1065,2023-11-24,Bob,East,9183.11,18,Food,1239.09,1273.98,New,0.02,Bank Transfer,Retail,East-Bob
1009,2023-08-17,Bob,West,8912.4,33,Clothing,450.72,918.17,Returning,0.11,Cash,Online,West-Bob
1035,2023-03-03,Bob,West,2494.74,47,Electronics,2936.48,3096.64,New,0.06,Bank Transfer,Online,West-Bob
1099,2023-03-04,David,East,7952.11,10,Furniture,1531.2,1955.56,New,0.0,Credit Card,Online,East-David
1044,2023-05-23,Bob,West,8552.47,19,Food,2182.75,2504.03,New,0.01,Bank Transfer,Online,West-Bob
1091,2023-05-25,Alice,North,9610.21,24,Clothing,3639.3,3750.63,New,0.23,Bank Transfer,Retail,North-Alice
1063,2023-10-16,Charlie,North,9775.35,4,Clothing,1134.67,1201.39,New,0.3,Bank Transfer,Retail,North-Charlie
1036,2023-04-28,Charlie,West,7739.11,25,Furniture,4037.73,4446.45,Returning,0.09,Bank Transfer,Online,West-Charlie
1028,2023-08-04,Alice,North,2363.9,38,Clothing,3350.32,3449.94,New,0.26,Cash,Online,North-Alice
1084,2023-06-22,Eve,North,6658.1,49,Furniture,4291.97,4645.64,Returning,0.26,Credit Card,Online,North-Eve
1072,2023-12-26,Charlie,North,3635.5,23,Furniture,1662.83,2074.25,New,0.12,Bank Transfer,Online,North-Charlie
1027,2023-02-07,Bob,West,7896.74,3,Food,999.09,1271.99,New,0.15,Credit Card,Online,West-Bob
1059,2023-05-21,Alice,North,5108.98,37,Electronics,4146.99,4172.35,Returning,0.06,Cash,Retail,North-Alice
1032,2023-04-14,David,North,2286.44,45,Clothing,3712.35,3780.88,New,0.07,Cash,Retail,North-David
1096,2023-07-29,Charlie,West,485.41,38,Electronics,3955.66,4270.59,Returning,0.15,Credit Card,Online,West-Charlie
1062,2023-11-12,Eve,South,8681.03,9,Electronics,1468.05,1838.21,New,0.15,Bank Transfer,Retail,South-Eve
1052,2023-12-22,Charlie,West,9509.55,2,Furniture,3752.68,4017.91,Returning,0.16,Bank Transfer,Online,West-Charlie
1002,2023-10-20,David,North,5842.88,30,Clothing,4646.55,4784.28,Returning,0.1,Credit Card,Retail,North-David
1081,2023-04-16,Charlie,West,2896.71,44,Electronics,1362.15,1844.07,New,0.29,Credit Card,Online,West-Charlie
1090,2023-07-01,David,North,2150.05,31,Furniture,4496.86,4880.8,New,0.06,Cash,Retail,North-David
1070,2023-01-01,Eve,South,783.18,12,Furniture,664.33,863.03,Returning,0.25,Bank Transfer,Retail,South-Eve
1038,2023-11-09,David,East,6966.82,1,Food,1281.65,1709.71,Returning,0.14,Credit Card,Online,East-David
1098,2023-10-18,Eve,West,1600.79,21,Furniture,725.03,828.95,New,0.18,Bank Transfer,Online,West-Eve
1059,2023-07-29,Bob,South,7678.91,16,Furniture,4287.21,4464.28,Returning,0.2,Credit Card,Retail,South-Bob
1080,2023-01-17,Bob,South,4224.0,47,Furniture,4035.33,4211.25,Returning,0.07,Bank Transfer,Online,South-Bob
1020,2023-09-08,Eve,North,9733.47,26,Clothing,4472.35,4770.42,New,0.01,Credit Card,Retail,North-Eve
1059,2023-06-28,Bob,North,2338.64,13,Electronics,1969.78,2437.7,New,0.19,Credit Card,Retail,North-Bob
1036,2023-07-01,Alice,West,3111.57,17,Furniture,1475.0,1840.77,Returning,0.1,Credit Card,Online,West-Alice
1019,2023-07-17,David,South,7320.51,14,Clothing,1614.19,1882.79,New,0.25,Credit Card,Retail,South-David
1011,2023-12-03,Bob,East,8186.12,13,Electronics,1442.69,1882.57,Returning,0.28,Cash,Online,East-Bob
1057,2023-12-27,Bob,South,3772.32,31,Furniture,2403.16,2453.35,Returning,0.19,Credit Card,Online,South-Bob
1023,2023-04-28,Charlie,North,9850.1,5,Electronics,2311.25,2482.34,Returning,0.22,Credit Card,Retail,North-Charlie
1031,2023-12-08,David,North,7567.06,22,Food,4236.05,4382.32,New,0.2,Bank Transfer,Online,North-David
1002,2023-05-21,Charlie,West,7828.25,26,Clothing,2041.42,2291.17,Returning,0.28,Cash,Online,West-Charlie
1012,2023-11-14,Eve,North,519.98,6,Clothing,3609.42,4082.62,Returning,0.3,Bank Transfer,Retail,North-Eve
1037,2023-06-07,Alice,South,6055.38,4,Food,4721.7,5017.58,New,0.24,Cash,Retail,South-Alice
1009,2023-11-01,Bob,South,7172.8,14,Food,547.79,958.76,Returning,0.07,Credit Card,Retail,South-Bob
1019,2023-05-24,Eve,South,1114.91,13,Food,3102.73,3202.68,New,0.09,Cash,Online,South-Eve
1048,2023-01-19,Bob,West,5187.16,7,Clothing,4310.95,4723.2,Returning,0.05,Credit Card,Retail,West-Bob
1075,2023-08-10,Charlie,North,9217.85,17,Electronics,4966.66,5037.27,Returning,0.24,Bank Transfer,Retail,North-Charlie
1036,2023-11-15,Bob,West,7316.91,19,Furniture,2844.97,3215.0,Returning,0.09,Credit Card,Retail,West-Bob
1038,2023-05-12,Bob,South,8630.74,20,Clothing,2607.31,2774.86,New,0.27,Credit Card,Retail,South-Bob
1099,2023-02-24,David,East,8090.0,35,Clothing,2610.19,2682.53,New,0.14,Cash,Retail,East-David
1099,2023-05-11,Alice,South,3518.89,48,Food,3441.61,3693.45,Returning,0.19,Bank Transfer,Online,South-Alice
1082,2023-06-11,Alice,North,7041.58,17,Furniture,890.31,1159.06,Returning,0.06,Cash,Retail,North-Alice
1066,2023-03-28,Charlie,North,7297.86,7,Clothing,523.42,632.44,New,0.2,Bank Transfer,Online,North-Charlie
1035,2023-10-15,David,North,9476.2,1,Furniture,610.83,808.69,New,0.22,Credit Card,Online,North-David
1068,2023-09-04,Eve,East,3905.11,14,Food,1140.58,1438.76,Returning,0.03,Bank Transfer,Online,East-Eve
1033,2023-11-19,David,North,349.41,37,Electronics,2600.76,2937.57,New,0.17,Credit Card,Retail,North-David
1020,2023-09-06,Charlie,East,9705.55,4,Clothing,3730.0,3893.6,New,0.25,Bank Transfer,Retail,East-Charlie
1054,2023-10-29,David,West,4025.88,8,Clothing,3610.21,3817.99,Returning,0.15,Cash,Retail,West-David
1021,2023-01-07,Bob,North,2971.45,9,Furniture,3365.28,3730.43,New,0.17,Bank Transfer,Online,North-Bob
1064,2023-05-31,David,South,2579.63,8,Clothing,816.54,1191.9,New,0.03,Cash,Retail,South-David
1004,2023-07-07,Eve,North,6772.8,35,Clothing,2278.87,2646.53,Returning,0.09,Bank Transfer,Online,North-Eve
1064,2023-01-02,David,South,5533.7,10,Electronics,2242.01,2282.23,Returning,0.2,Credit Card,Online,South-David
1017,2023-07-16,Alice,South,3137.09,18,Furniture,1069.73,1180.04,Returning,0.22,Bank Transfer,Online,South-Alice
1046,2023-01-20,Eve,East,4104.82,43,Clothing,4052.42,4199.3,New,0.1,Bank Transfer,Retail,East-Eve
1006,2023-09-18,David,West,776.7,45,Furniture,1623.63,1814.63,New,0.29,Bank Transfer,Retail,West-David
1053,2023-12-21,Bob,North,660.2,44,Furniture,2045.0,2217.51,Returning,0.08,Credit Card,Online,North-Bob
1063,2023-07-21,Bob,East,6359.59,32,Electronics,975.31,1176.17,New,0.22,Bank Transfer,Retail,East-Bob
1048,2023-10-20,Alice,South,9688.52,6,Electronics,3717.3,4061.37,New,0.03,Bank Transfer,Retail,South-Alice
1042,2023-05-26,Bob,East,848.28,1,Electronics,1406.24,1535.57,New,0.08,Credit Card,Retail,East-Bob
1008,2023-12-08,Alice,South,3197.78,49,Electronics,2907.22,3385.61,New,0.13,Cash,Online,South-Alice
1087,2023-05-14,Charlie,West,9472.66,10,Electronics,3988.52,4240.23,New,0.05,Credit Card,Online,West-Charlie
1098,2023-04-08,Eve,North,9452.89,5,Electronics,2947.22,3145.27,New,0.1,Credit Card,Retail,North-Eve
1063,2023-06-22,Bob,South,5917.1,25,Electronics,3997.1,4212.65,New,0.22,Cash,Online,South-Bob
1025,2023-02-15,David,South,4140.7,45,Clothing,1588.04,1703.64,New,0.2,Bank Transfer,Retail,South-David
1058,2023-11-03,David,West,4050.45,42,Clothing,3600.95,3702.84,Returning,0.01,Cash,Retail,West-David
1015,2023-09-24,Bob,East,182.37,35,Clothing,3461.15,3631.75,Returning,0.27,Credit Card,Online,East-Bob
1094,2023-02-24,Bob,West,6171.59,7,Furniture,4122.38,4358.78,Returning,0.26,Bank Transfer,Retail,West-Bob
1090,2023-03-14,David,East,6761.43,47,Furniture,2310.82,2714.71,New,0.19,Cash,Retail,East-David
1001,2023-04-14,David,East,5488.11,2,Electronics,2631.68,2904.06,New,0.15,Bank Transfer,Online,East-David
1061,2023-04-18,Eve,North,3774.02,47,Electronics,146.27,498.46,New,0.06,Cash,Retail,North-Eve
1064,2023-06-21,Bob,West,9215.59,46,Electronics,984.53,1138.49,New,0.04,Bank Transfer,Online,West-Bob
1067,2023-04-11,Bob,East,8963.93,17,Food,2831.58,3186.15,New,0.24,Bank Transfer,Retail,East-Bob
1069,2023-05-29,Alice,North,4494.8,30,Electronics,300.01,477.68,New,0.11,Bank Transfer,Retail,North-Alice
1100,2023-05-23,Bob,West,7667.96,29,Food,3559.56,3607.15,Returning,0.21,Cash,Retail,West-Bob
1033,2023-02-28,David,West,4155.74,3,Clothing,2958.75,3177.64,Returning,0.17,Cash,Online,West-David
1069,2023-10-15,Bob,West,1688.58,46,Food,3663.51,4007.98,New,0.13,Cash,Online,West-Bob
1100,2023-09-23,Charlie,North,797.87,19,Electronics,1820.89,2257.92,New,0.12,Cash,Retail,North-Charlie
1034,2023-01-16,Alice,North,1937.9,13,Furniture,366.31,492.68,New,0.12,Credit Card,Retail,North-Alice
1052,2023-07-18,Eve,South,6675.77,42,Electronics,417.96,907.63,New,0.04,Cash,Retail,South-Eve
1096,2023-12-01,Bob,East,2962.96,20,Furniture,1994.9,2066.5,Returning,0.06,Bank Transfer,Online,East-Bob
1092,2023-03-23,Bob,South,7914.0,18,Food,3070.47,3475.29,Returning,0.2,Bank Transfer,Online,South-Bob
1032,2023-08-11,David,East,3147.18,5,Food,4714.74,5129.11,New,0.25,Bank Transfer,Online,East-David
1050,2023-06-01,Bob,South,5105.78,23,Furniture,3756.06,4255.73,Returning,0.04,Cash,Online,South-Bob
1035,2023-04-18,David,South,9417.1,34,Food,1105.05,1200.96,Returning,0.19,Cash,Online,South-David
1043,2023-10-20,Charlie,South,5081.01,22,Food,530.04,759.32,Returning,0.17,Bank Transfer,Retail,South-Charlie
1040,2023-01-15,Charlie,North,8601.77,19,Furniture,342.3,768.06,Returning,0.09,Credit Card,Online,North-Charlie
1087,2023-09-08,Charlie,North,119.72,20,Clothing,193.27,297.69,New,0.22,Cash,Online,North-Charlie
1034,2023-10-29,David,North,8919.47,34,Food,978.15,1040.21,New,0.12,Credit Card,Retail,North-David
1029,2023-07-04,Charlie,North,5240.32,31,Furniture,951.21,1320.32,New,0.15,Cash,Online,North-Charlie
1036,2023-09-29,Bob,North,6116.75,7,Clothing,2588.67,2847.76,New,0.22,Cash,Retail,North-Bob
1073,2023-12-06,Alice,North,2273.58,31,Food,4368.97,4696.85,Returning,0.25,Bank Transfer,Retail,North-Alice
1024,2023-03-06,Alice,South,9602.64,35,Electronics,1258.53,1624.89,New,0.08,Credit Card,Online,South-Alice
1036,2023-11-20,Alice,East,5454.96,32,Clothing,700.49,1126.52,New,0.29,Credit Card,Retail,East-Alice
1023,2023-07-12,Alice,North,5051.12,2,Food,665.89,944.79,New,0.1,Credit Card,Retail,North-Alice
1096,2023-11-01,Bob,South,8718.22,17,Food,2774.24,3069.94,Returning,0.23,Bank Transfer,Retail,South-Bob
1055,2023-07-06,Eve,South,1242.41,16,Clothing,4195.38,4461.51,Returning,0.09,Bank Transfer,Online,South-Eve
1089,2023-03-03,Charlie,North,2122.73,4,Furniture,4117.67,4280.06,Returning,0.18,Bank Transfer,Online,North-Charlie
1019,2023-07-18,Alice,North,7948.31,12,Clothing,4745.18,5145.88,Returning,0.19,Credit Card,Online,North-Alice
1061,2023-03-13,Bob,South,6321.42,11,Clothing,2594.71,2769.52,Returning,0.01,Bank Transfer,Retail,South-Bob
1028,2023-08-31,Eve,North,5403.0,28,Furniture,2055.28,2449.64,New,0.19,Credit Card,Online,North-Eve
1025,2023-09-19,Alice,East,8564.24,26,Electronics,2007.32,2202.87,Returning,0.11,Cash,Online,East-Alice
1052,2023-01-05,Bob,North,8837.34,11,Clothing,3451.59,3929.26,New,0.3,Credit Card,Retail,North-Bob
1039,2023-04-09,Alice,North,763.04,3,Food,391.19,471.75,Returning,0.27,Cash,Online,North-Alice
1053,2023-01-20,David,West,8785.77,42,Furniture,2443.57,2943.31,New,0.29,Cash,Online,West-David
1095,2023-03-03,Eve,East,6518.35,16,Electronics,3591.05,3625.35,Returning,0.05,Credit Card,Retail,East-Eve
1005,2023-05-25,Eve,North,833.64,2,Clothing,1392.15,1448.54,Returning,0.02,Bank Transfer,Retail,North-Eve
1087,2023-01-03,Charlie,East,8057.76,20,Furniture,3625.94,3880.53,New,0.24,Bank Transfer,Online,East-Charlie
1076,2023-04-30,Eve,West,3279.51,32,Clothing,4337.82,4460.71,Returning,0.3,Cash,Retail,West-Eve
1017,2023-12-23,Alice,East,780.27,33,Food,1551.25,1994.01,Returning,0.08,Cash,Online,East-Alice
1046,2023-09-24,Charlie,West,4695.96,41,Clothing,1825.37,2073.88,Returning,0.27,Cash,Retail,West-Charlie
1027,2023-07-14,Bob,South,6650.67,22,Food,3240.2,3606.09,New,0.07,Cash,Online,South-Bob
1005,2023-11-28,David,West,152.6,43,Furniture,1200.4,1430.45,New,0.08,Bank Transfer,Retail,West-David
1086,2023-05-04,Bob,West,7841.4,25,Food,2248.71,2626.02,New,0.08,Bank Transfer,Online,West-Bob
1017,2023-02-07,Charlie,West,7542.3,2,Food,728.41,1094.92,New,0.24,Cash,Retail,West-Charlie
1071,2023-11-24,Alice,West,8049.72,12,Food,4317.95,4636.59,New,0.18,Credit Card,Retail,West-Alice
1061,2023-03-22,Alice,East,8915.05,34,Clothing,2680.82,2771.02,New,0.2,Bank Transfer,Online,East-Alice
1039,2023-02-09,David,South,9091.46,20,Food,2014.11,2056.35,Returning,0.21,Bank Transfer,Retail,South-David
1090,2023-11-14,Bob,East,6575.91,1,Clothing,60.28,260.73,Returning,0.17,Cash,Online,East-Bob
1013,2023-02-25,Eve,East,4791.82,31,Food,2757.06,3023.97,Returning,0.21,Cash,Online,East-Eve
1033,2023-10-31,Eve,East,7982.79,18,Furniture,3124.48,3553.27,Returning,0.12,Cash,Retail,East-Eve
1038,2023-06-18,Eve,West,2792.27,24,Clothing,1543.91,1862.88,New,0.09,Bank Transfer,Online,West-Eve
1058,2023-12-29,David,North,2714.21,34,Electronics,3160.61,3273.22,Returning,0.08,Credit Card,Retail,North-David
1061,2023-12-22,Alice,North,1990.17,45,Clothing,1364.51,1844.8,Returning,0.18,Cash,Online,North-Alice
1031,2023-03-23,Eve,East,433.4,32,Clothing,3351.33,3711.47,New,0.16,Cash,Retail,East-Eve
1003,2023-07-25,Eve,West,5617.64,5,Food,2206.58,2490.47,New,0.28,Cash,Online,West-Eve
1016,2023-03-18,David,South,485.9,4,Food,688.98,863.81,New,0.27,Credit Card,Retail,South-David
1072,2023-08-21,Alice,West,8271.62,12,Clothing,710.99,876.46,Returning,0.03,Credit Card,Online,West-Alice
1008,2023-12-20,Charlie,West,765.83,23,Clothing,2296.93,2319.62,Returning,0.23,Bank Transfer,Retail,West-Charlie
1028,2023-08-12,Charlie,South,2490.82,41,Clothing,3956.03,4163.68,New,0.12,Bank Transfer,Retail,South-Charlie
1100,2023-12-01,Alice,East,1387.8,34,Furniture,4991.09,5402.28,Returning,0.0,Cash,Retail,East-Alice
1063,2023-10-05,Alice,South,7859.01,27,Food,2069.08,2246.24,New,0.06,Bank Transfer,Retail,South-Alice
1005,2023-09-08,Eve,North,7103.23,9,Electronics,4737.06,4869.5,New,0.07,Cash,Online,North-Eve
1027,2023-02-08,Alice,West,7179.49,20,Electronics,1748.11,2220.9,New,0.23,Credit Card,Retail,West-Alice
1077,2023-10-12,David,South,628.15,23,Electronics,557.52,822.39,Returning,0.29,Credit Card,Online,South-David
1092,2023-01-27,David,West,6939.75,26,Furniture,3697.29,4003.96,New,0.24,Cash,Online,West-David
1081,2023-07-14,Eve,North,7001.64,16,Clothing,2530.15,2568.13,New,0.01,Credit Card,Online,North-Eve
1053,2023-10-30,David,North,6033.09,1,Food,2258.44,2475.56,New,0.25,Cash,Online,North-David
1074,2023-05-27,Eve,West,6710.83,2,Food,3173.69,3503.11,New,0.2,Bank Transfer,Retail,West-Eve
1083,2023-02-27,Alice,West,1780.31,20,Clothing,3617.59,4003.5,New,0.01,Credit Card,Retail,West-Alice
1017,2023-01-15,Eve,North,289.53,6,Furniture,2594.42,3081.04,Returning,0.1,Bank Transfer,Retail,North-Eve
1073,2023-11-16,David,South,7026.43,48,Clothing,2658.9,2838.27,New,0.25,Credit Card,Online,South-David
1045,2023-01-12,Charlie,South,9613.11,35,Furniture,3777.94,4188.66,New,0.17,Bank Transfer,Online,South-Charlie
1095,2023-04-03,Charlie,East,5873.59,9,Food,2650.95,2860.42,New,0.12,Cash,Retail,East-Charlie
1012,2023-12-15,Bob,West,8821.63,13,Electronics,2231.66,2596.61,Returning,0.09,Bank Transfer,Retail,West-Bob
1094,2023-02-15,Charlie,South,8643.67,47,Food,3450.36,3557.38,New,0.2,Credit Card,Online,South-Charlie
1075,2023-06-15,Eve,North,9736.49,26,Furniture,1749.34,1935.25,New,0.14,Credit Card,Online,North-Eve
1050,2023-03-05,Bob,North,9755.9,20,Electronics,3318.92,3785.91,New,0.24,Bank Transfer,Online,North-Bob
1098,2023-07-24,Alice,South,8188.04,19,Electronics,4055.51,4258.84,Returning,0.03,Credit Card,Online,South-Alice
1082,2023-07-28,Alice,East,8540.22,48,Food,3380.52,3778.94,Returning,0.3,Bank Transfer,Online,East-Alice
1030,2023-08-05,Bob,West,9733.46,34,Electronics,3125.07,3564.19,Returning,0.09,Cash,Online,West-Bob
1029,2023-08-02,Eve,South,2855.85,46,Furniture,4609.66,4879.15,Returning,0.3,Cash,Retail,South-Eve
1004,2023-06-28,Bob,West,8003.1,38,Furniture,4881.63,5088.06,Returning,0.16,Credit Card,Retail,West-Bob
1069,2023-03-27,David,East,719.39,47,Electronics,4171.83,4320.93,New,0.07,Cash,Online,East-David
1034,2023-04-02,Charlie,West,2184.02,7,Electronics,2492.36,2738.68,Returning,0.11,Cash,Online,West-Charlie
1075,2023-01-02,David,West,919.09,26,Electronics,4535.38,4557.56,New,0.0,Credit Card,Online,West-David
1055,2023-10-16,David,East,3093.95,46,Clothing,4173.52,4294.85,Returning,0.03,Bank Transfer,Retail,East-David
1080,2023-08-21,David,South,5677.74,12,Electronics,2316.13,2525.27,Returning,0.12,Credit Card,Retail,South-David
1027,2023-04-16,Alice,East,8241.57,7,Food,2371.85,2457.29,New,0.03,Cash,Retail,East-Alice
1050,2023-11-13,Alice,North,4638.47,28,Food,1711.63,1951.24,New,0.22,Cash,Online,North-Alice
1092,2023-02-10,Bob,East,5426.42,47,Furniture,3681.53,4076.96,Returning,0.17,Cash,Retail,East-Bob
1049,2023-03-25,Eve,East,8611.97,17,Electronics,558.7,1004.08,Returning,0.03,Credit Card,Online,East-Eve
1090,2023-11-10,Alice,North,3349.51,16,Clothing,2183.37,2263.36,Returning,0.0,Bank Transfer,Retail,North-Alice
1073,2023-05-07,David,North,1347.42,29,Clothing,2152.68,2475.93,Returning,0.22,Bank Transfer,Online,North-David
1026,2023-10-24,David,East,2044.55,45,Food,1741.66,2169.86,Returning,0.14,Credit Card,Online,East-David
1063,2023-03-28,Charlie,South,4947.28,42,Food,1170.07,1669.95,Returning,0.12,Bank Transfer,Retail,South-Charlie
1048,2023-01-12,Charlie,East,6482.98,47,Clothing,702.44,1067.66,New,0.24,Cash,Retail,East-Charlie
1056,2023-04-29,Charlie,North,8274.54,10,Clothing,536.81,839.92,Returning,0.15,Bank Transfer,Online,North-Charlie
1003,2023-05-11,Charlie,North,6760.37,26,Electronics,3418.78,3824.1,New,0.19,Credit Card,Online,North-Charlie
1023,2023-07-21,Eve,North,2282.99,4,Clothing,1532.8,1619.69,Returning,0.05,Bank Transfer,Retail,North-Eve
1099,2023-04-03,Alice,North,2571.72,30,Furniture,4495.82,4794.01,New,0.18,Bank Transfer,Retail,North-Alice
1015,2023-07-26,David,North,2706.15,9,Electronics,4680.35,4758.11,Returning,0.05,Bank Transfer,Online,North-David
1017,2023-01-24,Eve,North,4637.4,27,Electronics,927.89,1399.09,Returning,0.27,Credit Card,Online,North-Eve
1086,2023-10-20,David,South,3577.07,32,Furniture,84.86,517.18,Returning,0.2,Credit Card,Retail,South-David
1025,2023-12-30,David,West,9215.32,28,Electronics,2097.84,2270.99,New,0.13,Credit Card,Retail,West-David
1010,2023-04-15,Charlie,North,4733.88,4,Food,4943.03,5442.15,Returning,0.29,Cash,Online,North-Charlie
1100,2023-12-20,David,West,1629.47,39,Electronics,3685.03,3743.39,New,0.01,Bank Transfer,Online,West-David`;

// ─── 2. PALETTE ─────────────────────────────────────────────
const COLORS = {
  blue:    "#3b82f6",
  violet:  "#7c3aed",
  emerald: "#10b981",
  orange:  "#f97316",
  rose:    "#f43f5e",
  sky:     "#0ea5e9",
  amber:   "#f59e0b",
  teal:    "#14b8a6",
  indigo:  "#6366f1",
  lime:    "#84cc16",
};
const PALETTE = Object.values(COLORS);

// ─── 3. GLOBAL STATE ─────────────────────────────────────────
let rawData   = [];  // Semua baris CSV yang sudah di-parse
let chartRefs = {};  // Referensi Chart.js untuk destroy saat update

// ─── 4. UTILITY ──────────────────────────────────────────────

const fmtCurrency = (n) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD",
    maximumFractionDigits: 0 }).format(n);

const fmtNumber = (n) => new Intl.NumberFormat("en-US").format(n);

const fmtPercent = (n) => (n * 100).toFixed(1) + "%";

/**
 * Agregasi: jumlahkan valueField untuk setiap nilai unik keyField.
 * Mengembalikan { labels[], values[] } diurutkan menurun.
 */
function aggregateSum(rows, keyField, valueField) {
  const map = {};
  for (const row of rows) {
    const k = row[keyField];
    map[k] = (map[k] || 0) + row[valueField];
  }
  const sorted = Object.entries(map).sort((a, b) => b[1] - a[1]);
  return {
    labels: sorted.map(([k]) => k),
    values: sorted.map(([, v]) => v),
  };
}

/**
 * Agregasi: hitung jumlah kemunculan setiap nilai unik keyField.
 * Mengembalikan { labels[], values[] }.
 */
function aggregateCount(rows, keyField) {
  const map = {};
  for (const row of rows) {
    const k = row[keyField];
    map[k] = (map[k] || 0) + 1;
  }
  return {
    labels: Object.keys(map),
    values: Object.values(map),
  };
}

// ─── 5. CSV PARSER ───────────────────────────────────────────

/**
 * Parse teks CSV (header + data rows) menjadi array of objects.
 * Kolom numerik secara otomatis dikonversi ke number.
 */
function parseCSV(text) {
  const lines  = text.trim().split(/\r?\n/);
  const header = lines[0].split(",").map((h) => h.trim());
  const rows   = [];

  for (let i = 1; i < lines.length; i++) {
    const cells = lines[i].split(",");
    if (cells.length < header.length) continue;
    const obj = {};
    header.forEach((col, idx) => {
      const raw = (cells[idx] || "").trim();
      const num = parseFloat(raw);
      obj[col] = isNaN(num) ? raw : num;
    });
    rows.push(obj);
  }
  return rows;
}

// ─── 6. FILTER ───────────────────────────────────────────────

/** Baca nilai aktif dari keempat dropdown filter */
function getFilters() {
  return {
    region:   document.getElementById("filter-region").value,
    category: document.getElementById("filter-category").value,
    customer: document.getElementById("filter-customer").value,
    channel:  document.getElementById("filter-channel").value,
  };
}

/** Terapkan filter ke rawData dan kembalikan subset yang sesuai */
function applyFilters(filters) {
  return rawData.filter((row) => {
    if (filters.region   !== "all" && row.Region           !== filters.region)   return false;
    if (filters.category !== "all" && row.Product_Category !== filters.category) return false;
    if (filters.customer !== "all" && row.Customer_Type    !== filters.customer) return false;
    if (filters.channel  !== "all" && row.Sales_Channel    !== filters.channel)  return false;
    return true;
  });
}

/**
 * Isi dropdown filter dengan nilai unik dari rawData.
 * Dipanggil sekali saja saat init.
 */
function populateFilters() {
  const fields = {
    "filter-region":   "Region",
    "filter-category": "Product_Category",
    "filter-customer": "Customer_Type",
    "filter-channel":  "Sales_Channel",
  };
  for (const [id, field] of Object.entries(fields)) {
    const select = document.getElementById(id);
    const unique = [...new Set(rawData.map((r) => r[field]))].sort();
    unique.forEach((val) => {
      const opt = document.createElement("option");
      opt.value = val;
      opt.textContent = val;
      select.appendChild(opt);
    });
  }
}

// ─── 7. KPI ──────────────────────────────────────────────────

/** Hitung dan tampilkan 4 KPI card dari data yang sudah difilter */
function updateKPIs(data) {
  const totalRevenue      = data.reduce((s, r) => s + r.Sales_Amount, 0);
  const totalTransactions = data.length;
  const totalQty          = data.reduce((s, r) => s + r.Quantity_Sold, 0);
  const avgDiscount       = data.length
    ? data.reduce((s, r) => s + r.Discount, 0) / data.length
    : 0;

  document.getElementById("kpi-revenue").textContent      = fmtCurrency(totalRevenue);
  document.getElementById("kpi-transactions").textContent = fmtNumber(totalTransactions);
  document.getElementById("kpi-quantity").textContent     = fmtNumber(totalQty);
  document.getElementById("kpi-discount").textContent     = fmtPercent(avgDiscount);
}

// ─── 8. CHART FACTORY ────────────────────────────────────────

/**
 * Buat atau perbarui Chart.js instance.
 * Jika chart dengan id tersebut sudah ada, destroy dulu.
 */
function upsertChart(id, config) {
  if (chartRefs[id]) chartRefs[id].destroy();
  const ctx = document.getElementById(id).getContext("2d");
  chartRefs[id] = new Chart(ctx, config);
}

// ─── 9. CHART RENDERERS ──────────────────────────────────────

/** Chart 1 — Sales Trend bulanan (Line) */
function renderSalesTrend(data) {
  const monthly = {};
  for (const row of data) {
    const key = row.Sale_Date.slice(0, 7); // "2023-01"
    monthly[key] = (monthly[key] || 0) + row.Sales_Amount;
  }
  const sorted = Object.entries(monthly).sort(([a], [b]) => a.localeCompare(b));
  const labels = sorted.map(([k]) => {
    const [y, m] = k.split("-");
    return new Date(+y, +m - 1).toLocaleString("en-US", { month: "short", year: "2-digit" });
  });
  const values = sorted.map(([, v]) => v);

  upsertChart("chart-trend", {
    type: "line",
    data: {
      labels,
      datasets: [{
        label: "Revenue",
        data: values,
        borderColor: COLORS.blue,
        backgroundColor: "rgba(59,130,246,0.1)",
        borderWidth: 2.5,
        pointRadius: 4,
        pointHoverRadius: 6,
        fill: true,
        tension: 0.4,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: (ctx) => " " + fmtCurrency(ctx.parsed.y) } },
      },
      scales: {
        x: { grid: { display: false } },
        y: {
          beginAtZero: false,
          ticks: { callback: (v) => "$" + (v / 1000).toFixed(0) + "k" },
        },
      },
    },
  });
}

/** Chart 2 — Revenue per Region (Horizontal Bar) */
function renderRevenueRegion(data) {
  const { labels, values } = aggregateSum(data, "Region", "Sales_Amount");
  upsertChart("chart-region", {
    type: "bar",
    data: {
      labels,
      datasets: [{
        label: "Revenue",
        data: values,
        backgroundColor: PALETTE.slice(0, labels.length),
        borderRadius: 6,
      }],
    },
    options: {
      indexAxis: "y",
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: (ctx) => " " + fmtCurrency(ctx.parsed.x) } },
      },
      scales: {
        x: { beginAtZero: true, ticks: { callback: (v) => "$" + (v / 1000).toFixed(0) + "k" } },
        y: { grid: { display: false } },
      },
    },
  });
}

/** Chart 3 — Revenue per Product Category (Vertical Bar) */
function renderRevenueCategory(data) {
  const { labels, values } = aggregateSum(data, "Product_Category", "Sales_Amount");
  upsertChart("chart-category", {
    type: "bar",
    data: {
      labels,
      datasets: [{
        label: "Revenue",
        data: values,
        backgroundColor: PALETTE.slice(0, labels.length),
        borderRadius: 6,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: (ctx) => " " + fmtCurrency(ctx.parsed.y) } },
      },
      scales: {
        x: { grid: { display: false } },
        y: { beginAtZero: true, ticks: { callback: (v) => "$" + (v / 1000).toFixed(0) + "k" } },
      },
    },
  });
}

/** Chart 4 — Sales per Sales Representative (Horizontal Bar) */
function renderSalesRep(data) {
  const { labels, values } = aggregateSum(data, "Sales_Rep", "Sales_Amount");
  upsertChart("chart-salesrep", {
    type: "bar",
    data: {
      labels,
      datasets: [{
        label: "Revenue",
        data: values,
        backgroundColor: PALETTE.slice(0, labels.length),
        borderRadius: 6,
      }],
    },
    options: {
      indexAxis: "y",
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: (ctx) => " " + fmtCurrency(ctx.parsed.x) } },
      },
      scales: {
        x: { beginAtZero: true, ticks: { callback: (v) => "$" + (v / 1000).toFixed(0) + "k" } },
        y: { grid: { display: false } },
      },
    },
  });
}

/** Chart 5 — Customer Type Distribution (Doughnut) */
function renderCustomerType(data) {
  const { labels, values } = aggregateCount(data, "Customer_Type");
  upsertChart("chart-customer", {
    type: "doughnut",
    data: {
      labels,
      datasets: [{
        data: values,
        backgroundColor: [COLORS.blue, COLORS.emerald],
        hoverOffset: 8,
        borderWidth: 2,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: "62%",
      plugins: {
        legend: { position: "bottom", labels: { padding: 12, font: { size: 11 } } },
        tooltip: { callbacks: { label: (ctx) => ` ${ctx.label}: ${ctx.parsed}` } },
      },
    },
  });
}

/** Chart 6 — Payment Method Usage (Doughnut) */
function renderPaymentMethod(data) {
  const { labels, values } = aggregateCount(data, "Payment_Method");
  upsertChart("chart-payment", {
    type: "doughnut",
    data: {
      labels,
      datasets: [{
        data: values,
        backgroundColor: [COLORS.violet, COLORS.orange, COLORS.sky],
        hoverOffset: 8,
        borderWidth: 2,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: "62%",
      plugins: {
        legend: { position: "bottom", labels: { padding: 12, font: { size: 11 } } },
        tooltip: { callbacks: { label: (ctx) => ` ${ctx.label}: ${ctx.parsed}` } },
      },
    },
  });
}

/** Chart 7 — Sales Channel Distribution (Doughnut) */
function renderSalesChannel(data) {
  const { labels, values } = aggregateCount(data, "Sales_Channel");
  upsertChart("chart-channel", {
    type: "doughnut",
    data: {
      labels,
      datasets: [{
        data: values,
        backgroundColor: [COLORS.teal, COLORS.rose],
        hoverOffset: 8,
        borderWidth: 2,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: "62%",
      plugins: {
        legend: { position: "bottom", labels: { padding: 12, font: { size: 11 } } },
        tooltip: { callbacks: { label: (ctx) => ` ${ctx.label}: ${ctx.parsed}` } },
      },
    },
  });
}

/** Chart 8 — Discount vs Sales Amount (Scatter) */
function renderDiscountScatter(data) {
  const points = data.map((r) => ({
    x: +(r.Discount * 100).toFixed(1),
    y: +r.Sales_Amount.toFixed(2),
  }));
  upsertChart("chart-scatter", {
    type: "scatter",
    data: {
      datasets: [{
        label: "Transaksi",
        data: points,
        backgroundColor: "rgba(99,102,241,0.5)",
        pointRadius: 5,
        pointHoverRadius: 7,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (ctx) =>
              ` Discount: ${ctx.parsed.x}%  |  Sales: ${fmtCurrency(ctx.parsed.y)}`,
          },
        },
      },
      scales: {
        x: {
          title: { display: true, text: "Discount (%)", font: { size: 11 } },
          ticks: { callback: (v) => v + "%" },
        },
        y: {
          title: { display: true, text: "Sales Amount (USD)", font: { size: 11 } },
          ticks: { callback: (v) => "$" + (v / 1000).toFixed(0) + "k" },
        },
      },
    },
  });
}

/** Chart 9 — Top 10 Highest Sales Transactions (Horizontal Bar) */
function renderTop10(data) {
  const top10  = [...data].sort((a, b) => b.Sales_Amount - a.Sales_Amount).slice(0, 10);
  const labels = top10.map((r) => `ID ${r.Product_ID} · ${r.Sales_Rep} (${r.Region})`);
  const values = top10.map((r) => r.Sales_Amount);

  upsertChart("chart-top10", {
    type: "bar",
    data: {
      labels,
      datasets: [{
        label: "Sales Amount",
        data: values,
        backgroundColor: PALETTE.slice(0, 10),
        borderRadius: 6,
      }],
    },
    options: {
      indexAxis: "y",
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: (ctx) => " " + fmtCurrency(ctx.parsed.x) } },
      },
      scales: {
        x: { beginAtZero: true, ticks: { callback: (v) => "$" + (v / 1000).toFixed(1) + "k" } },
        y: { grid: { display: false } },
      },
    },
  });
}

/** Chart 10 — Quantity Sold per Category (Vertical Bar) */
function renderQtyCategory(data) {
  const { labels, values } = aggregateSum(data, "Product_Category", "Quantity_Sold");
  upsertChart("chart-qty-category", {
    type: "bar",
    data: {
      labels,
      datasets: [{
        label: "Quantity",
        data: values,
        backgroundColor: [COLORS.emerald, COLORS.amber, COLORS.sky, COLORS.rose, COLORS.violet],
        borderRadius: 6,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: (ctx) => ` ${fmtNumber(ctx.parsed.y)} units` } },
      },
      scales: {
        x: { grid: { display: false } },
        y: { beginAtZero: true, ticks: { callback: (v) => fmtNumber(v) } },
      },
    },
  });
}

// ─── 10. ORCHESTRATOR ────────────────────────────────────────

/**
 * Render ulang semua KPI dan chart berdasarkan filter aktif.
 * Dipanggil saat load awal dan setiap kali filter berubah.
 */
function renderDashboard() {
  const filters = getFilters();
  const data    = applyFilters(filters);

  updateKPIs(data);
  renderSalesTrend(data);
  renderRevenueRegion(data);
  renderRevenueCategory(data);
  renderSalesRep(data);
  renderCustomerType(data);
  renderPaymentMethod(data);
  renderSalesChannel(data);
  renderDiscountScatter(data);
  renderTop10(data);
  renderQtyCategory(data);
}

// ─── 11. EVENT BINDING ───────────────────────────────────────

function bindFilters() {
  const ids = ["filter-region", "filter-category", "filter-customer", "filter-channel"];

  // Re-render setiap kali nilai filter berubah
  ids.forEach((id) => {
    document.getElementById(id).addEventListener("change", renderDashboard);
  });

  // Tombol Reset — kembalikan semua filter ke "all"
  document.getElementById("btn-reset").addEventListener("click", () => {
    ids.forEach((id) => { document.getElementById(id).value = "all"; });
    renderDashboard();
  });
}

// ─── 12. INIT ────────────────────────────────────────────────

/**
 * Entry point — parse CSV_RAW, populate filter, lalu render dashboard.
 * Tidak perlu fetch/server karena data sudah embedded di atas.
 */
function init() {
  // Parse data dari constant string
  rawData = parseCSV(CSV_RAW);

  // Tampilkan jumlah record dan waktu muat
  const ts = new Date().toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" });
  document.getElementById("last-updated").textContent =
    `${rawData.length} records · Updated ${ts}`;

  populateFilters();
  bindFilters();
  renderDashboard();
}

// Jalankan saat DOM siap
document.addEventListener("DOMContentLoaded", init);
