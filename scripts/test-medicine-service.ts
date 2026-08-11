import { searchMedicines } from "../services/domain/medicineService";

async function runMedicineServiceAcceptanceTests() {
  console.log("=== Running Medicine & Price Lookup Acceptance Tests ===");

  // Test 1: Search returns generic name, ingredient, class, and prices
  console.log("\n[Test 1] searchMedicines('Paracetamol')");
  const results = await searchMedicines("Paracetamol");

  console.log(`Returned ${results.length} medicine results`);

  if (results.length >= 1) {
    const med = results[0];
    console.log(`- Brand: ${med.brandName}`);
    console.log(`- Generic: ${med.genericName}`);
    console.log(`- Ingredient: ${med.activeIngredient}`);
    console.log(`- Class: ${med.drugClass}`);
    console.log(`- Prices count: ${med.prices.length}`);

    if (med.genericName && med.activeIngredient && med.drugClass && med.prices.length > 0) {
      console.log("✅ Test 1 Passed: Search returns generic name, active ingredient, drug class, and price comparison.");
    } else {
      console.error("❌ Test 1 Failed", med);
      process.exit(1);
    }
  } else {
    console.error("❌ Test 1 Failed: Search returned empty array", results);
    process.exit(1);
  }

  // Test 2: Search by drug class
  console.log("\n[Test 2] searchMedicines('Antibiotic')");
  const antibioticResults = await searchMedicines("Antibiotic");
  if (antibioticResults.length >= 1 && antibioticResults[0].drugClass.includes("Antibiotic")) {
    console.log("✅ Test 2 Passed: Search by drug class succeeded.");
  } else {
    console.error("❌ Test 2 Failed", antibioticResults);
    process.exit(1);
  }

  console.log("\n🎉 ALL MEDICINE ACCEPTANCE TESTS PASSED!");
}

runMedicineServiceAcceptanceTests();
