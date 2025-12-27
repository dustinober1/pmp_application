#!/usr/bin/env python3
"""
Balance the correct answer distribution across PMP 2026 question banks.

This script shuffles the answer choices for each question to achieve a more
uniform distribution of correct answers (closer to 25% for each position).

It also updates the explanation text to reflect the new answer positions,
replacing letter references (A:, B:, C:, D:) with their new positions.
"""

import json
import random
import re
from pathlib import Path
from collections import Counter
from copy import deepcopy

# Set seed for reproducibility (remove for true randomness)
random.seed(42)


def load_questions(file_path: str) -> list:
    """Load questions from a JSON file."""
    with open(file_path, 'r', encoding='utf-8') as f:
        return json.load(f)


def save_questions(file_path: str, questions: list):
    """Save questions to a JSON file."""
    with open(file_path, 'w', encoding='utf-8') as f:
        json.dump(questions, f, indent=2, ensure_ascii=False)


def index_to_letter(index: int) -> str:
    """Convert index (0-3) to letter (A-D)."""
    return chr(65 + index)


def letter_to_index(letter: str) -> int:
    """Convert letter (A-D) to index (0-3)."""
    return ord(letter.upper()) - 65


def update_explanation_references(explanation: str, old_to_new_mapping: dict) -> str:
    """
    Update letter references in the explanation based on the shuffle mapping.
    
    The explanation typically contains patterns like:
    - "A: Some explanation about choice A"
    - "Option A is correct because..."
    - "Answer A addresses..."
    
    Args:
        explanation: The original explanation text
        old_to_new_mapping: Dict mapping old index -> new index
    
    Returns:
        Updated explanation with corrected letter references
    """
    # Create letter mapping (e.g., {'A': 'C', 'B': 'A', ...})
    letter_mapping = {}
    for old_idx, new_idx in old_to_new_mapping.items():
        old_letter = index_to_letter(old_idx)
        new_letter = index_to_letter(new_idx)
        letter_mapping[old_letter] = new_letter
    
    # Use placeholders to avoid double-replacement issues
    # First pass: replace with placeholders
    placeholder_map = {}
    result = explanation
    
    for i, (old_letter, new_letter) in enumerate(letter_mapping.items()):
        placeholder = f"__PLACEHOLDER_{i}__"
        placeholder_map[placeholder] = new_letter
        
        # Match patterns like "A:", "A.", "A,", "(A)", "Option A", "Answer A", etc.
        # Be careful to match standalone letters followed by punctuation or in specific contexts
        patterns = [
            (rf'\b{old_letter}:', f'{placeholder}:'),           # "A:" at word boundary
            (rf'\b{old_letter}\.(?=\s)', f'{placeholder}.'),    # "A." followed by space
            (rf'\b{old_letter},', f'{placeholder},'),           # "A," 
            (rf'\({old_letter}\)', f'({placeholder})'),         # "(A)"
            (rf'\b{old_letter}\)', f'{placeholder})'),          # "A)" 
            (rf'Option {old_letter}\b', f'Option {placeholder}'),  # "Option A"
            (rf'Answer {old_letter}\b', f'Answer {placeholder}'),  # "Answer A"
            (rf'Choice {old_letter}\b', f'Choice {placeholder}'),  # "Choice A"
        ]
        
        for pattern, replacement in patterns:
            result = re.sub(pattern, replacement, result)
    
    # Second pass: replace placeholders with actual new letters
    for placeholder, new_letter in placeholder_map.items():
        result = result.replace(placeholder, new_letter)
    
    return result


def shuffle_question_choices(question: dict) -> dict:
    """
    Shuffle the choices for a single question and update all references.
    
    Returns a new question dict with:
    - Shuffled choices array
    - Updated correctAnswerIndex
    - Updated explanation with correct letter references
    """
    question = deepcopy(question)
    
    choices = question.get('choices', [])
    correct_index = question.get('correctAnswerIndex')
    explanation = question.get('explanation', '')
    
    if not choices or correct_index is None:
        return question
    
    # Create indexed choices to track original positions
    indexed_choices = list(enumerate(choices))
    
    # Shuffle the indexed choices
    random.shuffle(indexed_choices)
    
    # Extract the new order
    new_choices = [choice for _, choice in indexed_choices]
    
    # Create mapping: old_index -> new_index
    old_to_new = {}
    new_correct_index = None
    
    for new_idx, (old_idx, _) in enumerate(indexed_choices):
        old_to_new[old_idx] = new_idx
        if old_idx == correct_index:
            new_correct_index = new_idx
    
    # Update the question
    question['choices'] = new_choices
    question['correctAnswerIndex'] = new_correct_index
    
    # Update explanation references
    if explanation:
        question['explanation'] = update_explanation_references(explanation, old_to_new)
    
    return question


def analyze_distribution(questions: list) -> dict:
    """Analyze the distribution of correct answers."""
    counts = Counter(q.get('correctAnswerIndex') for q in questions if q.get('correctAnswerIndex') is not None)
    total = sum(counts.values())
    return {
        'counts': dict(counts),
        'total': total,
        'percentages': {k: (v / total * 100) if total > 0 else 0 for k, v in counts.items()}
    }


def print_distribution(name: str, analysis: dict):
    """Print distribution analysis."""
    print(f"\n{name}:")
    print(f"  Total: {analysis['total']} questions")
    for idx in sorted(analysis['counts'].keys()):
        letter = index_to_letter(idx)
        count = analysis['counts'][idx]
        pct = analysis['percentages'][idx]
        print(f"  {idx} ({letter}): {count:4d} ({pct:5.1f}%)")


def process_question_bank(file_path: Path, dry_run: bool = True) -> tuple:
    """
    Process a single question bank file.
    
    Args:
        file_path: Path to the JSON file
        dry_run: If True, don't save changes, just analyze
    
    Returns:
        Tuple of (before_analysis, after_analysis)
    """
    print(f"\n{'='*60}")
    print(f"Processing: {file_path.name}")
    print(f"{'='*60}")
    
    questions = load_questions(file_path)
    before = analyze_distribution(questions)
    print_distribution("BEFORE shuffling", before)
    
    # Shuffle all questions
    shuffled_questions = [shuffle_question_choices(q) for q in questions]
    after = analyze_distribution(shuffled_questions)
    print_distribution("AFTER shuffling", after)
    
    if not dry_run:
        # Create backup
        backup_path = file_path.with_suffix('.backup.json')
        save_questions(backup_path, questions)
        print(f"\n  ✓ Backup saved to: {backup_path.name}")
        
        # Save shuffled version
        save_questions(file_path, shuffled_questions)
        print(f"  ✓ Shuffled questions saved to: {file_path.name}")
    else:
        print(f"\n  [DRY RUN - No changes saved]")
    
    return before, after


def main():
    import argparse
    
    parser = argparse.ArgumentParser(description='Balance answer distribution in PMP question banks')
    parser.add_argument('--apply', action='store_true', 
                        help='Actually apply changes (default is dry run)')
    parser.add_argument('--seed', type=int, default=42,
                        help='Random seed for reproducibility (default: 42)')
    args = parser.parse_args()
    
    random.seed(args.seed)
    
    base_path = Path(__file__).parent
    question_banks = [
        base_path / 'pmp_2026_people_bank.json',
        base_path / 'pmp_2026_process_bank.json',
        base_path / 'pmp_2026_business_bank.json'
    ]
    
    print("\n" + "🔄 PMP 2026 Question Bank - Answer Distribution Balancer")
    print("=" * 60)
    
    if args.apply:
        print("⚠️  APPLYING CHANGES (backups will be created)")
    else:
        print("📋 DRY RUN MODE - No changes will be saved")
        print("   Run with --apply to save changes")
    
    all_before = {'counts': Counter(), 'total': 0}
    all_after = {'counts': Counter(), 'total': 0}
    
    for file_path in question_banks:
        if file_path.exists():
            before, after = process_question_bank(file_path, dry_run=not args.apply)
            
            # Aggregate totals
            for idx, count in before['counts'].items():
                all_before['counts'][idx] = all_before['counts'].get(idx, 0) + count
            all_before['total'] += before['total']
            
            for idx, count in after['counts'].items():
                all_after['counts'][idx] = all_after['counts'].get(idx, 0) + count
            all_after['total'] += after['total']
        else:
            print(f"\n⚠️  File not found: {file_path}")
    
    # Print combined summary
    print(f"\n{'='*60}")
    print("📈 COMBINED SUMMARY")
    print(f"{'='*60}")
    
    # Calculate percentages for combined
    all_before['percentages'] = {k: (v / all_before['total'] * 100) for k, v in all_before['counts'].items()}
    all_after['percentages'] = {k: (v / all_after['total'] * 100) for k, v in all_after['counts'].items()}
    
    print_distribution("BEFORE (All Banks)", all_before)
    print_distribution("AFTER (All Banks)", all_after)
    
    # Show improvement
    print(f"\n📊 Distribution Improvement:")
    ideal = all_before['total'] / 4
    print(f"   Ideal per answer: {ideal:.1f} ({25.0:.1f}%)")
    
    print(f"\n   {'Answer':<8} {'Before':<12} {'After':<12} {'Δ from Ideal':<15}")
    print(f"   {'-'*47}")
    for idx in range(4):
        letter = index_to_letter(idx)
        before_pct = all_before['percentages'].get(idx, 0)
        after_pct = all_after['percentages'].get(idx, 0)
        delta = after_pct - 25.0
        sign = "+" if delta > 0 else ""
        print(f"   {idx} ({letter})    {before_pct:5.1f}%       {after_pct:5.1f}%       {sign}{delta:.1f}%")


if __name__ == "__main__":
    main()
