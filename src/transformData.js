export const transformData = (data, labels) => {
  function loop(rows) {
    return rows.map((row) => {
      return mapFn(row);
    });
  }

  function mapFn(obj) {
    const to_add = { ...obj };
    to_add["Enrollment Avg % Change"] = EnrAvgPerChng(to_add);
    to_add["Enrollment Minimum"] = EnrMinimum(to_add);
    to_add["Degree Avg % Change"] = DegAvgPerChng(to_add);
    to_add["Degree Minimum"] = DegMinimum(to_add);
    to_add[`Ratio of ${labels["DEG03"]} to ${labels["ENR03"]}`] =
      Ratio3(to_add);
    to_add[`Ratio of ${labels["DEG02"]} to ${labels["ENR02"]}`] =
      Ratio2(to_add);
    to_add[`Ratio of ${labels["DEG01"]} to ${labels["ENR01"]}`] =
      Ratio1(to_add);
    to_add["Average Ratio"] = AvgRatio(to_add);
    to_add["Ratio Met"] = RatioMet(to_add);
    to_add["Enroll Trend"] = EnrollTrend(to_add);
    to_add["Enroll Min"] = EnrollMin(to_add);
    to_add["DA Trend"] = DATrend(to_add);
    to_add["DA Min"] = DAMin(to_add);
    // overwrites "Y" or "N" with 1 or 0
    to_add["Ratio Met"] = Ratio(to_add);
    to_add["Metrics Met"] = MetricsMet(to_add);
    to_add["Review Type"] = ReviewType(to_add);
    return to_add;
  }

  function checkZero(value, int = 0) {
    if (value <= 0) {
      return int;
    } else {
      return value;
    }
  }

  function EnrAvgPerChng(obj) {
    return (
      ((obj["ENR02"] - obj["ENR03"]) / checkZero(obj["ENR03"], 1) +
        (obj["ENR01"] - obj["ENR02"]) / checkZero(obj["ENR02"], 1)) /
      2
    );
  }

  function EnrMinimum(obj) {
    let Enr;
    if (["UC", "GC"].includes(obj["CPE_DEGREE_CODE"].trim().slice(0, 2))) {
      Enr = 10;
    } else if (obj["_100_DL"] == "Y") {
      Enr = 40;
    } else if (obj["LEVL"] == "UG") {
      Enr = 25;
    } else {
      Enr = 20;
    }
    if (obj["ENR01"] >= Enr) {
      return "Yes";
    } else {
      return "No";
    }
  }

  function DegAvgPerChng(obj) {
    return (
      ((obj["DEG02"] - obj["DEG03"]) / checkZero(obj["DEG03"], 1) +
        (obj["DEG01"] - obj["DEG02"]) / checkZero(obj["DEG02"], 1)) /
      2
    );
  }

  function DegMinimum(obj) {
    let Deg;
    if (["UC", "GC"].includes(obj["CPE_DEGREE_CODE"].trim().slice(0, 2))) {
      Deg = 3;
    } else if (obj["_100_DL"] !== "Y") {
      Deg = 7;
    } else if (obj["LEVL"] == "UG") {
      Deg = 10;
    } else {
      Deg = 15;
    }
    if (obj["DEG01"] >= Deg) {
      return "Yes";
    } else {
      return "No";
    }
  }

  function ratioFn(obj, number) {
    const n = parseFloat(
      parseInt(obj[`DEG0${number}`]) / parseInt(obj[`ENR0${number}`])
    );

    if (typeof n === "number" && (Number.isNaN(n) || !Number.isFinite(n))) {
      return 0;
    }

    return n;
  }

  function Ratio3(obj) {
    return ratioFn(obj, 3);
  }

  function Ratio2(obj) {
    return ratioFn(obj, 2);
  }

  function Ratio1(obj) {
    return ratioFn(obj, 1);
  }

  function AvgRatio(obj) {
    return checkZero(
      (obj[`Ratio of ${labels["DEG03"]} to ${labels["ENR03"]}`] +
        obj[`Ratio of ${labels["DEG02"]} to ${labels["ENR02"]}`] +
        obj[`Ratio of ${labels["DEG01"]} to ${labels["ENR01"]}`]) /
        3
    );
  }

  function RatioMet(obj) {
    let AR;
    if (["UC", "GC"].includes(obj["CPE_DEGREE_CODE"].trim().slice(0, 2))) {
      AR = 0.3;
    } else if (obj["LEVL"] == "UG") {
      AR = 0.25;
    } else {
      AR = 0.39;
    }
    if (obj["Average Ratio"] >= AR) {
      return "Yes";
    } else {
      return "No";
    }
  }

  function EnrollTrend(obj) {
    if (obj["Enrollment Avg % Change"] > 0.04) {
      return 1;
    } else {
      return 0;
    }
  }

  function EnrollMin(obj) {
    if (obj["Enrollment Minimum"] == "Yes") {
      return 1;
    } else {
      return 0;
    }
  }

  function DATrend(obj) {
    var num = Number(obj["Degree Avg % Change"]);
    if (num > 0.01) {
      return 1;
    } else {
      return 0;
    }
  }

  function DAMin(obj) {
    if (obj["Degree Minimum"] == "Yes") {
      return 1;
    } else {
      return 0;
    }
  }

  function Ratio(obj) {
    if (obj["Ratio Met"] == "Yes") {
      return 1;
    } else {
      return 0;
    }
  }

  function MetricsMet(obj) {
    return (
      obj["Enroll Trend"] +
      obj["Enroll Min"] +
      obj["DA Trend"] +
      obj["DA Min"] +
      obj["Ratio Met"]
    );
  }

  function ReviewType(obj) {
    const x = obj["Metrics Met"];

    if (x >= 4) return "Expedited Review";

    if (x <= 1) return "Full Review";

    return "Streamlined Review";

    // streamlined - 2s & 3s

    // full review - 0s & 1s

    // expedited - >=4s
    // if (obj["Metrics Met"] >= 4) {
    //   return "Expedited Review";
    // } else if (obj["Metrics Met"] <= 2) {
    //   return "Full Review";
    // } else {
    //   return "Streamlined Review";
    // }
  }

  // const row10390 = data.find((row) => row["KPEDS_PROGRAM_ID"] === "10390");

  // console.log("10390", row10390);

  // console.log("labels", labels);

  return loop(data).map((row) =>
    Object.fromEntries(
      Object.entries(row)
        .filter(([key]) => !["ENR04", "DEG04"].includes(key))
        .map(([key, value]) => [key in labels ? labels[key] : key, value])
    )
  );
};
