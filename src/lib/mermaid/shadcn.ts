const adjustHsl = (col: string, { h = 0, s = 0, l = 0 }: { h?: number; s?: number; l?: number }) =>
	`hsl(from ${col} calc(h + ${h}deg) calc(s + ${s}%) calc(l + ${l}%))`;

const adjustRgb = (col: string, { r = 0, g = 0, b = 0 }: { r?: number; g?: number; b?: number }) =>
	`rgb(from ${col} calc(r + ${r}) calc(g + ${g}) calc(b + ${b}))`;

const lighten = (col: string, amount = 10) =>
	`color-mix(in oklab, ${col} ${100 - amount}%, white ${amount}%)`;

const darken = (col: string, amount = 10) =>
	`color-mix(in oklab, ${col} ${100 - amount}%, black ${amount}%)`;

const invert = (col: string) => `rgb(from ${col} calc(255 - r) calc(255 - g) calc(255 - b))`;

const mkBorder = (col: string) =>
	`light-dark(
    hsl(from ${col} h calc(s - 40%) calc(l - 10%)),
    hsl(from ${col} h calc(s - 40%) calc(l + 10%))
  )`;

const lightDark = (light: string, dark: string) => `light-dark(${light}, ${dark})`;

export class ShadcnTheme {
	constructor() {
		/** Base variables */
		(this as any).background = 'var(--background)';
		(this as any).primaryColor = 'var(--primary)';
		(this as any).noteBkgColor = 'var(--muted)';
		(this as any).noteTextColor = 'var(--muted-foreground)';

		(this as any).THEME_COLOR_LIMIT = 12;
		(this as any).radius = 5;
		(this as any).strokeWidth = 1;

		(this as any).fontFamily = 'var(--font-sans)';
		(this as any).fontSize = '16px';
		(this as any).useGradient = true;
		(this as any).dropShadow = 'drop-shadow(1px 2px 2px rgb(185 185 185 / 1))';
	}

	updateColors() {
		/* Main */
		(this as any).primaryTextColor = (this as any).primaryTextColor || 'var(--primary-foreground)';
		(this as any).secondaryColor = (this as any).secondaryColor || 'var(--secondary)';
		(this as any).tertiaryColor = (this as any).tertiaryColor || 'var(--muted)';

		(this as any).primaryBorderColor = (this as any).primaryBorderColor || 'var(--border)';
		(this as any).secondaryBorderColor = (this as any).secondaryBorderColor || 'var(--border)';
		(this as any).tertiaryBorderColor = (this as any).tertiaryBorderColor || 'var(--border)';
		(this as any).noteBorderColor =
			(this as any).noteBorderColor || mkBorder((this as any).noteBkgColor);
		(this as any).noteBkgColor = (this as any).noteBkgColor || 'var(--accent)';
		(this as any).noteTextColor = (this as any).noteTextColor || 'var(--accent-foreground)';

		(this as any).secondaryTextColor =
			(this as any).secondaryTextColor || 'var(--secondary-foreground)';
		(this as any).tertiaryTextColor = (this as any).tertiaryTextColor || 'var(--muted-foreground)';
		(this as any).lineColor = (this as any).lineColor || 'var(--foreground)';
		(this as any).arrowheadColor = (this as any).arrowheadColor || (this as any).lineColor;
		(this as any).textColor = (this as any).textColor || 'var(--foreground)';

		(this as any).border2 = (this as any).border2 || (this as any).tertiaryBorderColor;

		/* Flowchart variables */
		(this as any).nodeBkg = (this as any).nodeBkg || 'var(--card)';
		(this as any).mainBkg = (this as any).mainBkg || 'var(--card)';
		(this as any).nodeBorder = (this as any).nodeBorder || 'var(--border)';
		(this as any).clusterBkg = (this as any).clusterBkg || 'var(--muted)';
		(this as any).clusterBorder = (this as any).clusterBorder || 'var(--border)';
		(this as any).defaultLinkColor = (this as any).defaultLinkColor || (this as any).lineColor;
		(this as any).titleColor = (this as any).titleColor || (this as any).tertiaryTextColor;
		(this as any).edgeLabelBackground = (this as any).edgeLabelBackground || 'var(--popover)';
		(this as any).nodeTextColor = (this as any).nodeTextColor || 'var(--card-foreground)';

		/* Sequence Diagram variables */
		(this as any).actorBorder = (this as any).actorBorder || (this as any).primaryBorderColor;
		(this as any).actorBkg = (this as any).actorBkg || (this as any).mainBkg;
		(this as any).actorTextColor = (this as any).actorTextColor || (this as any).nodeTextColor;
		(this as any).actorLineColor = (this as any).actorLineColor || (this as any).actorBorder;
		(this as any).labelBoxBkgColor = (this as any).labelBoxBkgColor || (this as any).actorBkg;
		(this as any).signalColor = (this as any).signalColor || (this as any).textColor;
		(this as any).signalTextColor = (this as any).signalTextColor || (this as any).textColor;
		(this as any).labelBoxBorderColor =
			(this as any).labelBoxBorderColor || (this as any).actorBorder;
		(this as any).labelTextColor = (this as any).labelTextColor || (this as any).actorTextColor;
		(this as any).loopTextColor = (this as any).loopTextColor || (this as any).actorTextColor;
		(this as any).activationBorderColor =
			(this as any).activationBorderColor ||
			lightDark(
				darken((this as any).secondaryColor, 10),
				lighten((this as any).secondaryColor, 10)
			);
		(this as any).activationBkgColor =
			(this as any).activationBkgColor || (this as any).secondaryColor;
		(this as any).sequenceNumberColor =
			(this as any).sequenceNumberColor || 'var(--primary-foreground)';

		/* Gantt chart variables */
		(this as any).sectionBkgColor = (this as any).sectionBkgColor || (this as any).tertiaryColor;
		(this as any).altSectionBkgColor = (this as any).altSectionBkgColor || 'var(--background)';
		(this as any).sectionBkgColor = (this as any).sectionBkgColor || (this as any).secondaryColor;
		(this as any).sectionBkgColor2 = (this as any).sectionBkgColor2 || (this as any).primaryColor;
		(this as any).excludeBkgColor = (this as any).excludeBkgColor || 'var(--muted)';
		(this as any).taskBorderColor =
			(this as any).taskBorderColor || (this as any).primaryBorderColor;
		(this as any).taskBkgColor = (this as any).taskBkgColor || (this as any).primaryColor;
		(this as any).activeTaskBorderColor =
			(this as any).activeTaskBorderColor || (this as any).primaryColor;
		(this as any).activeTaskBkgColor =
			(this as any).activeTaskBkgColor || lighten((this as any).primaryColor, 23);
		(this as any).gridColor = (this as any).gridColor || 'var(--border)';
		(this as any).doneTaskBkgColor = (this as any).doneTaskBkgColor || 'var(--muted)';
		(this as any).doneTaskBorderColor = (this as any).doneTaskBorderColor || 'var(--border)';
		(this as any).critBorderColor = (this as any).critBorderColor || 'var(--destructive)';
		(this as any).critBkgColor = (this as any).critBkgColor || 'var(--destructive)';
		(this as any).todayLineColor = (this as any).todayLineColor || 'var(--destructive)';
		(this as any).vertLineColor = (this as any).vertLineColor || 'var(--foreground)';
		(this as any).taskTextColor = (this as any).taskTextColor || (this as any).textColor;
		(this as any).taskTextOutsideColor =
			(this as any).taskTextOutsideColor || (this as any).textColor;
		(this as any).taskTextLightColor = (this as any).taskTextLightColor || (this as any).textColor;
		(this as any).taskTextColor = (this as any).taskTextColor || (this as any).primaryTextColor;
		(this as any).taskTextDarkColor = (this as any).taskTextDarkColor || (this as any).textColor;
		(this as any).taskTextClickableColor = (this as any).taskTextClickableColor || 'var(--ring)';

		(this as any).noteFontWeight = (this as any).noteFontWeight || 'normal';
		(this as any).fontWeight = (this as any).fontWeight || 'normal';

		/* Person */
		(this as any).personBorder = (this as any).personBorder || (this as any).primaryBorderColor;
		(this as any).personBkg = (this as any).personBkg || (this as any).mainBkg;

		/* ER diagram */
		(this as any).rowOdd =
			(this as any).rowOdd ||
			lightDark(lighten((this as any).mainBkg, 75), darken((this as any).mainBkg, 5));
		(this as any).rowEven =
			(this as any).rowEven ||
			lightDark(lighten((this as any).mainBkg, 5), darken((this as any).mainBkg, 10));

		/* state colors */
		(this as any).transitionColor = (this as any).transitionColor || (this as any).lineColor;
		(this as any).transitionLabelColor =
			(this as any).transitionLabelColor || (this as any).textColor;
		(this as any).stateLabelColor =
			(this as any).stateLabelColor || (this as any).stateBkg || (this as any).primaryTextColor;

		(this as any).stateBkg = (this as any).stateBkg || (this as any).mainBkg;
		(this as any).labelBackgroundColor =
			(this as any).labelBackgroundColor || (this as any).stateBkg;
		(this as any).compositeBackground =
			(this as any).compositeBackground || (this as any).background || (this as any).tertiaryColor;
		(this as any).altBackground = (this as any).altBackground || (this as any).tertiaryColor;
		(this as any).compositeTitleBackground =
			(this as any).compositeTitleBackground || (this as any).mainBkg;
		(this as any).compositeBorder = (this as any).compositeBorder || (this as any).nodeBorder;
		(this as any).innerEndBackground = (this as any).nodeBorder;
		(this as any).errorBkgColor = (this as any).errorBkgColor || (this as any).tertiaryColor;
		(this as any).errorTextColor = (this as any).errorTextColor || (this as any).tertiaryTextColor;
		(this as any).transitionColor = (this as any).transitionColor || (this as any).lineColor;
		(this as any).specialStateColor = (this as any).lineColor;

		/* Color Scale */
		(this as any).cScale0 = (this as any).cScale0 || 'var(--chart-1)';
		(this as any).cScale1 = (this as any).cScale1 || 'var(--chart-2)';
		(this as any).cScale2 = (this as any).cScale2 || 'var(--chart-3)';
		(this as any).cScale3 = (this as any).cScale3 || 'var(--chart-4)';
		(this as any).cScale4 = (this as any).cScale4 || 'var(--chart-5)';
		(this as any).cScale5 =
			(this as any).cScale5 || adjustHsl((this as any).primaryColor, { h: 90 });
		(this as any).cScale6 =
			(this as any).cScale6 || adjustHsl((this as any).primaryColor, { h: 120 });
		(this as any).cScale7 =
			(this as any).cScale7 || adjustHsl((this as any).primaryColor, { h: 150 });
		(this as any).cScale8 =
			(this as any).cScale8 || adjustHsl((this as any).primaryColor, { h: 210, l: 150 });
		(this as any).cScale9 =
			(this as any).cScale9 || adjustHsl((this as any).primaryColor, { h: 270 });
		(this as any).cScale10 =
			(this as any).cScale10 || adjustHsl((this as any).primaryColor, { h: 300 });
		(this as any).cScale11 =
			(this as any).cScale11 || adjustHsl((this as any).primaryColor, { h: 330 });

		for (let i = 0; i < (this as any).THEME_COLOR_LIMIT; i++) {
			(this as any)['cScale' + i] =
				(this as any)['cScale' + i] || adjustHsl((this as any).primaryColor, { h: i * 30 });

			(this as any)['cScale' + i] = lightDark(
				darken((this as any)['cScale' + i], 25),
				darken((this as any)['cScale' + i], 75)
			);
		}

		for (let i = 0; i < (this as any).THEME_COLOR_LIMIT; i++) {
			(this as any)['cScaleInv' + i] =
				(this as any)['cScaleInv' + i] || invert((this as any)['cScale' + i]);
		}

		for (let i = 0; i < (this as any).THEME_COLOR_LIMIT; i++) {
			(this as any)['cScalePeer' + i] =
				(this as any)['cScalePeer' + i] ||
				lightDark(
					darken((this as any)['cScale' + i], 10),
					lighten((this as any)['cScale' + i], 10)
				);
		}

		(this as any).scaleLabelColor = (this as any).scaleLabelColor || (this as any).labelTextColor;

		for (let i = 0; i < (this as any).THEME_COLOR_LIMIT; i++) {
			(this as any)['cScaleLabel' + i] =
				(this as any)['cScaleLabel' + i] || (this as any).scaleLabelColor;
		}

		for (let i = 0; i < 5; i++) {
			(this as any)['surface' + i] =
				(this as any)['surface' + i] ||
				lightDark(
					adjustHsl((this as any).mainBkg, { h: 180, s: -15, l: -(5 + i * 3) }),
					adjustHsl((this as any).mainBkg, { h: 180, s: -15, l: -(5 + i * 3) * 4 })
				);

			(this as any)['surfacePeer' + i] =
				(this as any)['surfacePeer' + i] ||
				lightDark(
					adjustHsl((this as any).mainBkg, { h: 180, s: -15, l: -(8 + i * 3) }),
					adjustHsl((this as any).mainBkg, { h: 180, s: -15, l: -(8 + i * 3) * 4 })
				);
		}

		/* class */
		(this as any).classText = (this as any).classText || (this as any).textColor;

		/* user-journey */
		(this as any).fillType0 = (this as any).fillType0 || (this as any).primaryColor;
		(this as any).fillType1 = (this as any).fillType1 || (this as any).secondaryColor;
		(this as any).fillType2 =
			(this as any).fillType2 || adjustHsl((this as any).primaryColor, { h: 64 });
		(this as any).fillType3 =
			(this as any).fillType3 || adjustHsl((this as any).secondaryColor, { h: 64 });
		(this as any).fillType4 =
			(this as any).fillType4 || adjustHsl((this as any).primaryColor, { h: -64 });
		(this as any).fillType5 =
			(this as any).fillType5 || adjustHsl((this as any).secondaryColor, { h: -64 });
		(this as any).fillType6 =
			(this as any).fillType6 || adjustHsl((this as any).primaryColor, { h: 128 });
		(this as any).fillType7 =
			(this as any).fillType7 || adjustHsl((this as any).secondaryColor, { h: 128 });

		/* pie */
		(this as any).pie1 = (this as any).pie1 || (this as any).primaryColor;
		(this as any).pie2 = (this as any).pie2 || (this as any).secondaryColor;
		(this as any).pie3 = (this as any).pie3 || (this as any).tertiaryColor;
		(this as any).pie4 = (this as any).pie4 || adjustHsl((this as any).primaryColor, { l: -10 });
		(this as any).pie5 = (this as any).pie5 || adjustHsl((this as any).secondaryColor, { l: -10 });
		(this as any).pie6 = (this as any).pie6 || adjustHsl((this as any).tertiaryColor, { l: -10 });
		(this as any).pie7 =
			(this as any).pie7 || adjustHsl((this as any).primaryColor, { h: 60, l: -10 });
		(this as any).pie8 =
			(this as any).pie8 || adjustHsl((this as any).primaryColor, { h: -60, l: -10 });
		(this as any).pie9 =
			(this as any).pie9 || adjustHsl((this as any).primaryColor, { h: 120, l: 0 });
		(this as any).pie10 =
			(this as any).pie10 || adjustHsl((this as any).primaryColor, { h: 60, l: -20 });
		(this as any).pie11 =
			(this as any).pie11 || adjustHsl((this as any).primaryColor, { h: -60, l: -20 });
		(this as any).pie12 =
			(this as any).pie12 || adjustHsl((this as any).primaryColor, { h: 120, l: -10 });
		(this as any).pieTitleTextSize = (this as any).pieTitleTextSize || '25px';
		(this as any).pieTitleTextColor =
			(this as any).pieTitleTextColor || (this as any).taskTextDarkColor;
		(this as any).pieSectionTextSize = (this as any).pieSectionTextSize || '17px';
		(this as any).pieSectionTextColor =
			(this as any).pieSectionTextColor || (this as any).textColor;
		(this as any).pieLegendTextSize = (this as any).pieLegendTextSize || '17px';
		(this as any).pieLegendTextColor =
			(this as any).pieLegendTextColor || (this as any).taskTextDarkColor;
		(this as any).pieStrokeColor = (this as any).pieStrokeColor || 'var(--foreground)';
		(this as any).pieStrokeWidth = (this as any).pieStrokeWidth || '2px';
		(this as any).pieOuterStrokeWidth = (this as any).pieOuterStrokeWidth || '2px';
		(this as any).pieOuterStrokeColor = (this as any).pieOuterStrokeColor || 'var(--foreground)';
		(this as any).pieOpacity = (this as any).pieOpacity || '0.7';

		/* venn */
		(this as any).venn1 = (this as any).venn1 ?? adjustHsl((this as any).primaryColor, { l: -30 });
		(this as any).venn2 =
			(this as any).venn2 ?? adjustHsl((this as any).secondaryColor, { l: -30 });
		(this as any).venn3 = (this as any).venn3 ?? adjustHsl((this as any).tertiaryColor, { l: -30 });
		(this as any).venn4 =
			(this as any).venn4 ?? adjustHsl((this as any).primaryColor, { h: 60, l: -30 });
		(this as any).venn5 =
			(this as any).venn5 ?? adjustHsl((this as any).primaryColor, { h: -60, l: -30 });
		(this as any).venn6 =
			(this as any).venn6 ?? adjustHsl((this as any).secondaryColor, { h: 60, l: -30 });
		(this as any).venn7 =
			(this as any).venn7 ?? adjustHsl((this as any).primaryColor, { h: 120, l: -30 });
		(this as any).venn8 =
			(this as any).venn8 ?? adjustHsl((this as any).secondaryColor, { h: 120, l: -30 });
		(this as any).vennTitleTextColor = (this as any).vennTitleTextColor ?? (this as any).titleColor;
		(this as any).vennSetTextColor = (this as any).vennSetTextColor ?? (this as any).textColor;

		/* radar */
		(this as any).radar = {
			axisColor: (this as any).radar?.axisColor || (this as any).lineColor,
			axisStrokeWidth: (this as any).radar?.axisStrokeWidth || 2,
			axisLabelFontSize: (this as any).radar?.axisLabelFontSize || 12,
			curveOpacity: (this as any).radar?.curveOpacity || 0.5,
			curveStrokeWidth: (this as any).radar?.curveStrokeWidth || 2,
			graticuleColor: (this as any).radar?.graticuleColor || 'var(--border)',
			graticuleStrokeWidth: (this as any).radar?.graticuleStrokeWidth || 1,
			graticuleOpacity: (this as any).radar?.graticuleOpacity || 0.3,
			legendBoxSize: (this as any).radar?.legendBoxSize || 12,
			legendFontSize: (this as any).radar?.legendFontSize || 12
		};

		/* architecture */
		(this as any).archEdgeColor = (this as any).archEdgeColor || 'var(--muted-foreground)';
		(this as any).archEdgeArrowColor =
			(this as any).archEdgeArrowColor || 'var(--muted-foreground)';
		(this as any).archEdgeWidth = (this as any).archEdgeWidth || '3';
		(this as any).archGroupBorderColor = (this as any).archGroupBorderColor || 'var(--foreground)';
		(this as any).archGroupBorderWidth = (this as any).archGroupBorderWidth || '2px';

		/* quadrant-graph */
		(this as any).quadrant1Fill = (this as any).quadrant1Fill || (this as any).primaryColor;
		(this as any).quadrant2Fill =
			(this as any).quadrant2Fill || adjustRgb((this as any).primaryColor, { r: 5, g: 5, b: 5 });
		(this as any).quadrant3Fill =
			(this as any).quadrant3Fill || adjustRgb((this as any).primaryColor, { r: 10, g: 10, b: 10 });
		(this as any).quadrant4Fill =
			(this as any).quadrant4Fill || adjustRgb((this as any).primaryColor, { r: 15, g: 15, b: 15 });
		(this as any).quadrant1TextFill =
			(this as any).quadrant1TextFill || (this as any).primaryTextColor;
		(this as any).quadrant2TextFill =
			(this as any).quadrant2TextFill ||
			adjustRgb((this as any).primaryTextColor, { r: -5, g: -5, b: -5 });
		(this as any).quadrant3TextFill =
			(this as any).quadrant3TextFill ||
			adjustRgb((this as any).primaryTextColor, { r: -10, g: -10, b: -10 });
		(this as any).quadrant4TextFill =
			(this as any).quadrant4TextFill ||
			adjustRgb((this as any).primaryTextColor, { r: -15, g: -15, b: -15 });
		(this as any).quadrantPointFill =
			(this as any).quadrantPointFill ||
			lightDark(darken((this as any).quadrant1Fill, 20), lighten((this as any).quadrant1Fill, 20));
		(this as any).quadrantPointTextFill =
			(this as any).quadrantPointTextFill || (this as any).primaryTextColor;
		(this as any).quadrantXAxisTextFill =
			(this as any).quadrantXAxisTextFill || (this as any).primaryTextColor;
		(this as any).quadrantYAxisTextFill =
			(this as any).quadrantYAxisTextFill || (this as any).primaryTextColor;
		(this as any).quadrantInternalBorderStrokeFill =
			(this as any).quadrantInternalBorderStrokeFill || (this as any).primaryBorderColor;
		(this as any).quadrantExternalBorderStrokeFill =
			(this as any).quadrantExternalBorderStrokeFill || (this as any).primaryBorderColor;
		(this as any).quadrantTitleFill =
			(this as any).quadrantTitleFill || (this as any).primaryTextColor;

		/* xychart */
		(this as any).xyChart = {
			backgroundColor: (this as any).xyChart?.backgroundColor || (this as any).background,
			titleColor: (this as any).xyChart?.titleColor || (this as any).primaryTextColor,
			dataLabelColor: (this as any).xyChart?.dataLabelColor || (this as any).primaryTextColor,
			xAxisTitleColor: (this as any).xyChart?.xAxisTitleColor || (this as any).primaryTextColor,
			xAxisLabelColor: (this as any).xyChart?.xAxisLabelColor || (this as any).primaryTextColor,
			xAxisTickColor: (this as any).xyChart?.xAxisTickColor || (this as any).primaryTextColor,
			xAxisLineColor: (this as any).xyChart?.xAxisLineColor || (this as any).primaryTextColor,
			yAxisTitleColor: (this as any).xyChart?.yAxisTitleColor || (this as any).primaryTextColor,
			yAxisLabelColor: (this as any).xyChart?.yAxisLabelColor || (this as any).primaryTextColor,
			yAxisTickColor: (this as any).xyChart?.yAxisTickColor || (this as any).primaryTextColor,
			yAxisLineColor: (this as any).xyChart?.yAxisLineColor || (this as any).primaryTextColor,
			plotColorPalette:
				(this as any).xyChart?.plotColorPalette ||
				[
					'var(--chart-1)',
					'var(--chart-2)',
					'var(--chart-3)',
					'var(--chart-4)',
					'var(--chart-5)',
					adjustHsl((this as any).primaryColor, { h: 180 }),
					adjustHsl((this as any).primaryColor, { h: 210 }),
					adjustHsl((this as any).primaryColor, { h: 240 }),
					adjustHsl((this as any).primaryColor, { h: 270 }),
					adjustHsl((this as any).primaryColor, { h: 300 })
				].join(',')
		};

		/* requirement-diagram */
		(this as any).requirementBackground =
			(this as any).requirementBackground || (this as any).primaryColor;
		(this as any).requirementBorderColor =
			(this as any).requirementBorderColor || (this as any).primaryBorderColor;
		(this as any).requirementBorderSize = (this as any).requirementBorderSize || '1';
		(this as any).requirementTextColor =
			(this as any).requirementTextColor || (this as any).primaryTextColor;
		(this as any).relationColor = (this as any).relationColor || (this as any).lineColor;
		(this as any).relationLabelBackground =
			(this as any).relationLabelBackground || 'var(--popover)';
		(this as any).relationLabelColor =
			(this as any).relationLabelColor || (this as any).actorTextColor;

		/* git */
		(this as any).git0 = (this as any).git0 || 'var(--chart-1)';
		(this as any).git1 = (this as any).git1 || 'var(--chart-2)';
		(this as any).git2 = (this as any).git2 || 'var(--chart-3)';
		(this as any).git3 = (this as any).git3 || adjustHsl((this as any).primaryColor, { h: -30 });
		(this as any).git4 = (this as any).git4 || adjustHsl((this as any).primaryColor, { h: -60 });
		(this as any).git5 = (this as any).git5 || adjustHsl((this as any).primaryColor, { h: -90 });
		(this as any).git6 = (this as any).git6 || adjustHsl((this as any).primaryColor, { h: 60 });
		(this as any).git7 = (this as any).git7 || adjustHsl((this as any).primaryColor, { h: 120 });

		for (let i = 0; i < 8; i++) {
			(this as any)['git' + i] = lightDark(
				darken((this as any)['git' + i], 25),
				lighten((this as any)['git' + i], 25)
			);
		}

		(this as any).gitInv0 = (this as any).gitInv0 || invert((this as any).git0);
		(this as any).gitInv1 = (this as any).gitInv1 || invert((this as any).git1);
		(this as any).gitInv2 = (this as any).gitInv2 || invert((this as any).git2);
		(this as any).gitInv3 = (this as any).gitInv3 || invert((this as any).git3);
		(this as any).gitInv4 = (this as any).gitInv4 || invert((this as any).git4);
		(this as any).gitInv5 = (this as any).gitInv5 || invert((this as any).git5);
		(this as any).gitInv6 = (this as any).gitInv6 || invert((this as any).git6);
		(this as any).gitInv7 = (this as any).gitInv7 || invert((this as any).git7);

		(this as any).branchLabelColor =
			(this as any).branchLabelColor || lightDark((this as any).labelTextColor, 'black');
		(this as any).gitBranchLabel0 = (this as any).gitBranchLabel0 || (this as any).branchLabelColor;
		(this as any).gitBranchLabel1 = (this as any).gitBranchLabel1 || (this as any).branchLabelColor;
		(this as any).gitBranchLabel2 = (this as any).gitBranchLabel2 || (this as any).branchLabelColor;
		(this as any).gitBranchLabel3 = (this as any).gitBranchLabel3 || (this as any).branchLabelColor;
		(this as any).gitBranchLabel4 = (this as any).gitBranchLabel4 || (this as any).branchLabelColor;
		(this as any).gitBranchLabel5 = (this as any).gitBranchLabel5 || (this as any).branchLabelColor;
		(this as any).gitBranchLabel6 = (this as any).gitBranchLabel6 || (this as any).branchLabelColor;
		(this as any).gitBranchLabel7 = (this as any).gitBranchLabel7 || (this as any).branchLabelColor;

		(this as any).tagLabelColor = (this as any).tagLabelColor || (this as any).primaryTextColor;
		(this as any).tagLabelBackground =
			(this as any).tagLabelBackground || (this as any).primaryColor;
		(this as any).tagLabelBorder = (this as any).tagBorder || (this as any).primaryBorderColor;
		(this as any).tagLabelFontSize = (this as any).tagLabelFontSize || '10px';
		(this as any).commitLabelColor =
			(this as any).commitLabelColor || (this as any).secondaryTextColor;
		(this as any).commitLabelBackground =
			(this as any).commitLabelBackground || (this as any).secondaryColor;
		(this as any).commitLabelFontSize = (this as any).commitLabelFontSize || '10px';

		/* Event Modeling diagrams */
		(this as any).emScreenFill = (this as any).emScreenFill || 'var(--card)';
		(this as any).emScreenStroke = (this as any).emScreenStroke || 'var(--border)';
		(this as any).emProcessorFill =
			(this as any).emProcessorFill || adjustHsl('var(--chart-4)', { h: 40, l: 10 });
		(this as any).emProcessorStroke =
			(this as any).emProcessorStroke || darken((this as any).emProcessorFill, 20);
		(this as any).emReadModelFill =
			(this as any).emReadModelFill || adjustHsl('var(--chart-2)', { l: 20 });
		(this as any).emReadModelStroke =
			(this as any).emReadModelStroke || darken((this as any).emReadModelFill, 20);
		(this as any).emCommandFill =
			(this as any).emCommandFill || adjustHsl('var(--chart-1)', { h: 30, l: 15 });
		(this as any).emCommandStroke =
			(this as any).emCommandStroke || darken((this as any).emCommandFill, 20);
		(this as any).emEventFill = (this as any).emEventFill || adjustHsl('var(--chart-5)', { l: 10 });
		(this as any).emEventStroke =
			(this as any).emEventStroke || darken((this as any).emEventFill, 20);
		(this as any).emSwimlaneBackgroundOdd = (this as any).emSwimlaneBackgroundOdd || 'var(--muted)';
		(this as any).emSwimlaneBackgroundStroke =
			(this as any).emSwimlaneBackgroundStroke || 'var(--border)';
		(this as any).emArrowhead = (this as any).emArrowhead || (this as any).lineColor;
		(this as any).emRelationStroke = (this as any).emRelationStroke || (this as any).lineColor;

		/* EntityRelationship diagrams */
		(this as any).attributeBackgroundColorOdd =
			(this as any).attributeBackgroundColorOdd || '#ffffff';
		(this as any).attributeBackgroundColorEven =
			(this as any).attributeBackgroundColorEven || '#f2f2f2';

		(this as any).gradientStart = (this as any).primaryBorderColor;
		(this as any).gradientStop = (this as any).secondaryBorderColor;
	}

	calculate(overrides: Record<string, string> | undefined) {
		if (typeof overrides !== 'object' || overrides === null) {
			(this as any).updateColors();
			return;
		}

		const keys = Object.keys(overrides);

		keys.forEach((k) => {
			(this as any)[k] = overrides[k];
		});

		(this as any).updateColors();

		keys.forEach((k) => {
			(this as any)[k] = overrides[k];
		});
	}
}
