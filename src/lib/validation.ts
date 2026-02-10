import { TemplateType } from '../api/levels';

/**
 * Validates the configuration for a specific activity template.
 * Returns null if valid, or an error message string if invalid.
 */
export const validateActivity = (template: TemplateType, config: any): string | null => {
  if (!config) return 'Configuration is missing.';

  switch (template) {
    // ==================== LANGUAGE ACTIVITIES ====================
    case 'letter_tracing':
      if (!config.letter || typeof config.letter !== 'string' || config.letter.length !== 1) {
        return 'Letter must be a single character.';
      }
      if (!config.prompt) return 'Prompt is required.';
      break;

    case 'audio_matching':
      if (!config.pairs || !Array.isArray(config.pairs) || config.pairs.length === 0) {
        return 'At least one audio-word pair is required.';
      }
      for (const pair of config.pairs) {
        if (!pair.audioAssetPath) return 'All pairs must have an audio asset.';
        if (!pair.word) return 'All pairs must have a word.';
      }
      break;

    case 'listen_and_choose':
      if (!config.imageAssets || !Array.isArray(config.imageAssets) || config.imageAssets.length < 2) {
        return 'At least 2 image options are required.';
      }
      if (typeof config.correctAnswer !== 'number') return 'Correct answer index is missing.';
      if (config.correctAnswer < 0 || config.correctAnswer >= config.imageAssets.length) {
        return `Correct answer index (${config.correctAnswer}) is out of bounds (0-${config.imageAssets.length - 1}).`;
      }
      break;

    case 'fill_the_blank':
      if (!config.options || !Array.isArray(config.options) || config.options.length === 0) {
        return 'At least one option is required.';
      }
      if (typeof config.correctAnswer !== 'number') return 'Correct answer index is missing.';
      if (config.correctAnswer < 0 || config.correctAnswer >= config.options.length) {
        return `Correct answer index (${config.correctAnswer}) is out of bounds (0-${config.options.length - 1}).`;
      }
      break;

    case 'reorder_words':
      if (!config.words || !Array.isArray(config.words) || config.words.length === 0) {
        return 'At least one word is required.';
      }
      if (!config.correctOrder || !Array.isArray(config.correctOrder)) {
        return 'Correct order array is required.';
      }
      if (config.correctOrder.length !== config.words.length) {
        return `Correct order list length (${config.correctOrder.length}) must match words list length (${config.words.length}).`;
      }
      // Check for duplicate indices or out of bounds
      const sortedIndices = [...config.correctOrder].sort((a, b) => a - b);
      for (let i = 0; i < sortedIndices.length; i++) {
        if (sortedIndices[i] !== i) {
          return 'Correct order must contain all indices from 0 to length-1 once.';
        }
      }
      break;

    case 'multiple_choice':
      if (!config.options || !Array.isArray(config.options) || config.options.length < 2) {
        return 'At least 2 options are required.';
      }
      if (!config.correctIndices || !Array.isArray(config.correctIndices) || config.correctIndices.length === 0) {
        return 'At least one correct answer must be selected.';
      }
      const maxMcIndex = config.options.length - 1;
      for (const index of config.correctIndices) {
        if (index < 0 || index > maxMcIndex) {
          return `Correct index ${index} is out of bounds (0-${maxMcIndex}).`;
        }
      }
      break;

    // ==================== MATH ACTIVITIES ====================
    case 'solve_equation':
      if (!config.equation) return 'Equation is required.';
      if (!config.options || !Array.isArray(config.options) || config.options.length < 2) {
        return 'At least 2 number options are required.';
      }
      if (typeof config.correctAnswer !== 'number') return 'Correct answer (value) is required.';
      if (!config.options.includes(config.correctAnswer)) {
        return `Correct answer value (${config.correctAnswer}) must be one of the provided options: [${config.options.join(', ')}].`;
      }
      break;

    case 'count_by':
      if (!config.initialSequence || !Array.isArray(config.initialSequence) || config.initialSequence.length === 0) {
        return 'Initial sequence is required.';
      }
      if (!config.correctAnswers || !Array.isArray(config.correctAnswers) || config.correctAnswers.length === 0) {
        return 'Correct answers list cannot be empty.';
      }
      if (config.numberOfInputs !== config.correctAnswers.length) {
        return `Number of Inputs (${config.numberOfInputs}) must match the number of Correct Answers (${config.correctAnswers.length}).`;
      }
      break;

    case 'number_matching':
      if (!config.items || !Array.isArray(config.items) || config.items.length === 0) {
        return 'At least one number-image pair is required.';
      }
      for (const item of config.items) {
        if (!item.number) return 'All items must have a number label.';
        if (!item.imageAsset) return `Image asset missing for number ${item.number}.`;
      }
      break;

    case 'arrange_numbers':
      if (!config.numbers || !Array.isArray(config.numbers) || config.numbers.length < 2) {
        return 'At least 2 numbers are required to arrange.';
      }
      break;

    case 'follow_pattern':
      if (!config.examples || !Array.isArray(config.examples) || config.examples.length === 0) {
        return 'At least one pattern example is required.';
      }
      if (!config.options || !Array.isArray(config.options) || config.options.length < 2) {
        return 'At least 2 options are required.';
      }
      if (typeof config.correctAnswerIndex !== 'number') return 'Correct answer index is missing.';
      if (config.correctAnswerIndex < 0 || config.correctAnswerIndex >= config.options.length) {
        return `Correct answer index (${config.correctAnswerIndex}) is out of bounds (0-${config.options.length - 1}).`;
      }
      break;

    case 'story_problem':
      if (!config.instruction) return 'Story instruction is required.';
      if (!config.unitName) return 'Unit name (e.g., "apples") is required.';
      if (!config.draggableOptions || !Array.isArray(config.draggableOptions) || config.draggableOptions.length === 0) {
        return 'At least one draggable option is required.';
      }
      const ids = new Set();
      let possibleTotal = 0;
      for (const opt of config.draggableOptions) {
        if (!opt.id) return 'All draggable options must have an ID.';
        if (ids.has(opt.id)) return `Duplicate option ID found: ${opt.id}. IDs must be unique.`;
        ids.add(opt.id);
        possibleTotal += (opt.value || 0);
      }
      if (config.correctTotalValue <= 0) return 'Correct total value must be greater than 0.';
      // We can't easily check strict achievability (knapsack problem) but we can check bounds
       // Simple check: is correct total reachable if we use infinite copies? Yes, mostly.
       // Check if correct total > max possible with reasonable usage?
       // Just ensuring options exist is a good start.
      break;

    // ==================== PATTERN & VISUAL ACTIVITIES ====================
    case 'shape_pattern':
      if (!config.patternImages || !Array.isArray(config.patternImages) || config.patternImages.length === 0) {
        return 'Pattern images are required.';
      }
      if (!config.optionImages || !Array.isArray(config.optionImages) || config.optionImages.length < 2) {
        return 'At least 2 option images are required.';
      }
      if (typeof config.correctIndex !== 'number') return 'Correct answer index is missing.';
      if (config.correctIndex < 0 || config.correctIndex >= config.optionImages.length) {
        return `Correct index (${config.correctIndex}) is out of bounds (0-${config.optionImages.length - 1}).`;
      }
      break;

    case 'memory_card':
      if (!config.pairs || !Array.isArray(config.pairs) || config.pairs.length === 0) {
        return 'At least one pair of cards is required.';
      }
      break;

    // ==================== MEDIA ACTIVITIES ====================
    case 'video':
      if (!config.videoUrl || typeof config.videoUrl !== 'string' || config.videoUrl.trim() === '') {
        return 'Video URL is required.';
      }
      break;

    case 'story':
      if (!config.elements || !Array.isArray(config.elements) || config.elements.length === 0) {
        return 'Story must have at least one element.';
      }
      break;
      
    default:
      // Unknown template, skip validation or return null
      return null;
  }

  return null;
};
