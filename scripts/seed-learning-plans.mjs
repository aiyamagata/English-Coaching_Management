import { drizzle } from "drizzle-orm/mysql2";
import { learningPlans, learningSteps } from "../drizzle/schema.ts";

if (!process.env.DATABASE_URL) {
  console.error("❌ DATABASE_URLが設定されていません");
  process.exit(1);
}

const db = drizzle(process.env.DATABASE_URL);

async function seedLearningPlans() {
  console.log("🌱 学習プラン・ステップのマスタデータを投入します...");

  // 既存データをクリア
  await db.delete(learningSteps);
  await db.delete(learningPlans);
  console.log("✓ 既存データをクリアしました");

  // ベーシックコース
  const basicResult = await db.insert(learningPlans).values({
    name: "ベーシックコース",
    description: "6ヶ月（保証8ヶ月）、シャドーイングまで完了",
  });
  const basicPlanId = Number(basicResult[0]?.insertId || basicResult.insertId);
  console.log(`✓ ベーシックコース作成 (ID: ${basicPlanId})`);

  await db.insert(learningSteps).values([
    {
      planId: basicPlanId,
      stepOrder: 1,
      title: "中学英文法",
      description: "112項目の基礎文法学習",
      estimatedDays: 35, // 5週間
    },
    {
      planId: basicPlanId,
      stepOrder: 2,
      title: "チャンク",
      description: "220項目のチャンク学習（発音記号と並行可）",
      estimatedDays: 90, // 3ヶ月
    },
    {
      planId: basicPlanId,
      stepOrder: 3,
      title: "発音記号",
      description: "個々の音の発音練習（Zoom 1回）",
      estimatedDays: 21, // 3週間
    },
    {
      planId: basicPlanId,
      stepOrder: 4,
      title: "音声変化",
      description: "リンキング・リダクション等（Zoom 1回）",
      estimatedDays: 21, // 3週間
    },
    {
      planId: basicPlanId,
      stepOrder: 5,
      title: "自己紹介",
      description: "全コース必修の自己紹介プログラム",
      estimatedDays: 60, // 2ヶ月
    },
    {
      planId: basicPlanId,
      stepOrder: 6,
      title: "シャドーイング",
      description: "全コース必修のシャドーイングプログラム（週3回まで添削）",
      estimatedDays: 60, // 2ヶ月
    },
  ]);
  console.log("✓ ベーシックコースのステップを作成しました");

  // スタンダードコース
  const standardResult = await db.insert(learningPlans).values({
    name: "スタンダードコース",
    description: "8ヶ月（保証12ヶ月）、質問回答まで完了",
  });
  const standardPlanId = Number(standardResult[0]?.insertId || standardResult.insertId);
  console.log(`✓ スタンダードコース作成 (ID: ${standardPlanId})`);

  await db.insert(learningSteps).values([
    {
      planId: standardPlanId,
      stepOrder: 1,
      title: "中学英文法",
      description: "112項目の基礎文法学習",
      estimatedDays: 35,
    },
    {
      planId: standardPlanId,
      stepOrder: 2,
      title: "チャンク",
      description: "220項目のチャンク学習（発音記号と並行可）",
      estimatedDays: 90,
    },
    {
      planId: standardPlanId,
      stepOrder: 3,
      title: "発音記号",
      description: "個々の音の発音練習（Zoom 1回）",
      estimatedDays: 21,
    },
    {
      planId: standardPlanId,
      stepOrder: 4,
      title: "音声変化",
      description: "リンキング・リダクション等（Zoom 1回）",
      estimatedDays: 21,
    },
    {
      planId: standardPlanId,
      stepOrder: 5,
      title: "自己紹介",
      description: "全コース必修の自己紹介プログラム",
      estimatedDays: 60,
    },
    {
      planId: standardPlanId,
      stepOrder: 6,
      title: "シャドーイング",
      description: "全コース必修のシャドーイングプログラム（週3回まで添削）",
      estimatedDays: 60,
    },
    {
      planId: standardPlanId,
      stepOrder: 7,
      title: "質問回答",
      description: "日常会話の質問に答える練習（Zoom 4回、隔週）",
      estimatedDays: 60,
    },
  ]);
  console.log("✓ スタンダードコースのステップを作成しました");

  // フルコース
  const fullResult = await db.insert(learningPlans).values({
    name: "フルコース",
    description: "12ヶ月（保証18ヶ月）、英会話まで完了",
  });
  const fullPlanId = Number(fullResult[0]?.insertId || fullResult.insertId);
  console.log(`✓ フルコース作成 (ID: ${fullPlanId})`);

  await db.insert(learningSteps).values([
    {
      planId: fullPlanId,
      stepOrder: 1,
      title: "中学英文法",
      description: "112項目の基礎文法学習",
      estimatedDays: 35,
    },
    {
      planId: fullPlanId,
      stepOrder: 2,
      title: "チャンク",
      description: "220項目のチャンク学習（発音記号と並行可）",
      estimatedDays: 90,
    },
    {
      planId: fullPlanId,
      stepOrder: 3,
      title: "発音記号",
      description: "個々の音の発音練習（Zoom 1回）",
      estimatedDays: 21,
    },
    {
      planId: fullPlanId,
      stepOrder: 4,
      title: "音声変化",
      description: "リンキング・リダクション等（Zoom 1回）",
      estimatedDays: 21,
    },
    {
      planId: fullPlanId,
      stepOrder: 5,
      title: "自己紹介",
      description: "全コース必修の自己紹介プログラム",
      estimatedDays: 60,
    },
    {
      planId: fullPlanId,
      stepOrder: 6,
      title: "シャドーイング",
      description: "全コース必修のシャドーイングプログラム（週3回まで添削）",
      estimatedDays: 60,
    },
    {
      planId: fullPlanId,
      stepOrder: 7,
      title: "質問回答",
      description: "日常会話の質問に答える練習（Zoom 4回、隔週）",
      estimatedDays: 60,
    },
    {
      planId: fullPlanId,
      stepOrder: 8,
      title: "英会話",
      description: "グループ英会話レッスン（Zoom 16回）",
      estimatedDays: 120,
    },
  ]);
  console.log("✓ フルコースのステップを作成しました");

  // プレミアムコース（フルコースと同じステップ構成）
  const premiumResult = await db.insert(learningPlans).values({
    name: "プレミアムコース",
    description: "12ヶ月（保証18ヶ月）、個別英会話48回付き",
  });
  const premiumPlanId = Number(premiumResult[0]?.insertId || premiumResult.insertId);
  console.log(`✓ プレミアムコース作成 (ID: ${premiumPlanId})`);

  await db.insert(learningSteps).values([
    {
      planId: premiumPlanId,
      stepOrder: 1,
      title: "中学英文法",
      description: "112項目の基礎文法学習",
      estimatedDays: 35,
    },
    {
      planId: premiumPlanId,
      stepOrder: 2,
      title: "チャンク",
      description: "220項目のチャンク学習（発音記号と並行可）",
      estimatedDays: 90,
    },
    {
      planId: premiumPlanId,
      stepOrder: 3,
      title: "発音記号",
      description: "個々の音の発音練習（Zoom 1回）",
      estimatedDays: 21,
    },
    {
      planId: premiumPlanId,
      stepOrder: 4,
      title: "音声変化",
      description: "リンキング・リダクション等（Zoom 1回）",
      estimatedDays: 21,
    },
    {
      planId: premiumPlanId,
      stepOrder: 5,
      title: "自己紹介",
      description: "全コース必修の自己紹介プログラム",
      estimatedDays: 60,
    },
    {
      planId: premiumPlanId,
      stepOrder: 6,
      title: "シャドーイング",
      description: "全コース必修のシャドーイングプログラム（週3回まで添削）",
      estimatedDays: 60,
    },
    {
      planId: premiumPlanId,
      stepOrder: 7,
      title: "質問回答",
      description: "日常会話の質問に答える練習（Zoom 4回、隔週）",
      estimatedDays: 60,
    },
    {
      planId: premiumPlanId,
      stepOrder: 8,
      title: "英会話",
      description: "個別英会話レッスン（Zoom 48回、週1回/1年間）",
      estimatedDays: 120,
    },
  ]);
  console.log("✓ プレミアムコースのステップを作成しました");

  console.log("\n✅ 学習プラン・ステップのマスタデータ投入が完了しました！");
  console.log(`   - ベーシックコース: 6ステップ`);
  console.log(`   - スタンダードコース: 7ステップ`);
  console.log(`   - フルコース: 8ステップ`);
  console.log(`   - プレミアムコース: 8ステップ`);

  process.exit(0);
}

seedLearningPlans().catch((error) => {
  console.error("❌ エラーが発生しました:", error);
  process.exit(1);
});
