// Helper for formating promotion (JSON -> int[]) and promotion calculation

// Convert promotionIds array into {int, str} objects.
export function shapePromoIds(val) {
    if (!Array.isArray(val)) return [];
    return val.map((x) => Number(x));
}

// Points rule for purchases: 4 points per $1, rounded.
export function pointsFromSpent(spent) {
    return Math.round(spent * 4);
}

// bonus are extra rate "on top of existing rate"
export function promoBonusFromSpent(spent, promo) {
    let bonus = 0;
    if (promo.rate != null) {
        bonus += Math.round(spent * 100 * promo.rate);
    }
    if (promo.points != null) {
        bonus += promo.points;
    }
    return bonus;
}

// Standard JSON shape for a transaction with joined user + createdBy.
export function txToResponse(tx) {
    const spentNum =
        tx.spent !== null && tx.spent !== undefined ? Number(tx.spent) : undefined;
  
    const base = {
        id: tx.id,
        utorid: tx.user?.utorid ?? null,
        type: tx.type,
        ...(spentNum !== undefined ? { spent: spentNum } : {}),
        amount: tx.amount,
        promotionIds: shapePromoIds(tx.promotionIds),
        suspicious: tx.suspicious,
        remark: tx.remark || '',
        createdBy: tx.createdBy?.utorid ?? null,
    };
  
    if (tx.type === 'adjustment') {
        base.relatedId = tx.relatedId ?? null;
    } else if (tx.type === 'redemption') {
        base.relatedId = tx.relatedId ?? null;
        base.redeemed = tx.redeemed ?? Math.abs(tx.amount);
    } else if (tx.type === 'transfer') {
        if (tx.relatedId != null) base.relatedId = tx.relatedId;
    }
    return base;
}