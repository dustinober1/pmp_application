#!/usr/bin/env python3
"""
Spot-check verification script for the answer shuffle.
Verifies that 5% of all questions were correctly transferred.

Checks:
1. The correct answer content is preserved (just at a different position)
2. The correctAnswerIndex points to the actual correct choice
3. All original choices are present (just reordered)
4. Explanation letter references were updated appropriately
"""

import json
import random
import re
from pathlib import Path
from collections import defaultdict

# Set seed for reproducibility
random.seed(123)


def load_questions(file_path: str) -> list:
    """Load questions from a JSON file."""
    with open(file_path, 'r', encoding='utf-8') as f:
        return json.load(f)


def index_to_letter(index: int) -> str:
    """Convert index (0-3) to letter (A-D)."""
    return chr(65 + index)


def find_letter_references(text: str) -> list:
    """Find all letter references (A:, B:, C:, D:) in text."""
    patterns = [
        r'\b([ABCD]):',           # "A:" at word boundary
        r'\b([ABCD])\.(?=\s)',    # "A." followed by space
        r'\(([ABCD])\)',          # "(A)"
        r'Option ([ABCD])\b',     # "Option A"
        r'Answer ([ABCD])\b',     # "Answer A"
        r'Choice ([ABCD])\b',     # "Choice A"
    ]
    
    found = []
    for pattern in patterns:
        matches = re.findall(pattern, text)
        found.extend(matches)
    
    return found


def verify_question(original: dict, updated: dict, question_idx: int) -> dict:
    """
    Verify a single question was correctly shuffled.
    
    Returns a dict with verification results.
    """
    results = {
        'question_idx': question_idx,
        'passed': True,
        'errors': [],
        'warnings': [],
        'details': {}
    }
    
    orig_choices = original.get('choices', [])
    upd_choices = updated.get('choices', [])
    orig_correct_idx = original.get('correctAnswerIndex')
    upd_correct_idx = updated.get('correctAnswerIndex')
    
    # Check 1: All original choices are present in updated (just reordered)
    orig_set = set(orig_choices)
    upd_set = set(upd_choices)
    
    if orig_set != upd_set:
        results['passed'] = False
        results['errors'].append("Choice content mismatch - some choices missing or added")
    
    results['details']['choices_preserved'] = orig_set == upd_set
    
    # Check 2: The correct answer content is the same
    if orig_correct_idx is not None and upd_correct_idx is not None:
        orig_correct_content = orig_choices[orig_correct_idx]
        upd_correct_content = upd_choices[upd_correct_idx]
        
        if orig_correct_content != upd_correct_content:
            results['passed'] = False
            results['errors'].append(
                f"Correct answer content mismatch!\n"
                f"  Original ({orig_correct_idx}): {orig_correct_content[:50]}...\n"
                f"  Updated ({upd_correct_idx}): {upd_correct_content[:50]}..."
            )
        
        results['details']['correct_answer_preserved'] = orig_correct_content == upd_correct_content
        results['details']['original_correct_idx'] = orig_correct_idx
        results['details']['updated_correct_idx'] = upd_correct_idx
    
    # Check 3: Verify the updated correctAnswerIndex actually points to the original correct choice
    if orig_correct_idx is not None:
        orig_correct_text = orig_choices[orig_correct_idx]
        try:
            actual_position_in_updated = upd_choices.index(orig_correct_text)
            if actual_position_in_updated != upd_correct_idx:
                results['passed'] = False
                results['errors'].append(
                    f"correctAnswerIndex mismatch!\n"
                    f"  Updated correctAnswerIndex: {upd_correct_idx}\n"
                    f"  Actual position of correct answer: {actual_position_in_updated}"
                )
            results['details']['index_correctly_updated'] = actual_position_in_updated == upd_correct_idx
        except ValueError:
            results['passed'] = False
            results['errors'].append("Original correct answer not found in updated choices!")
    
    # Check 4: Explanation letter references (informational - may have edge cases)
    orig_explanation = original.get('explanation', '')
    upd_explanation = updated.get('explanation', '')
    
    orig_refs = find_letter_references(orig_explanation)
    upd_refs = find_letter_references(upd_explanation)
    
    results['details']['orig_letter_refs'] = orig_refs
    results['details']['upd_letter_refs'] = upd_refs
    
    # If original had references, updated should have the same count
    if len(orig_refs) != len(upd_refs):
        results['warnings'].append(
            f"Letter reference count changed: {len(orig_refs)} -> {len(upd_refs)}"
        )
    
    # Check 5: Question text should be unchanged
    if original.get('questionText') != updated.get('questionText'):
        results['passed'] = False
        results['errors'].append("Question text was modified!")
    
    results['details']['question_text_preserved'] = original.get('questionText') == updated.get('questionText')
    
    return results


def verify_question_bank(bank_name: str, original_path: Path, updated_path: Path, sample_pct: float = 0.05):
    """
    Verify a question bank by spot-checking a percentage of questions.
    """
    original = load_questions(original_path)
    updated = load_questions(updated_path)
    
    if len(original) != len(updated):
        print(f"  ❌ ERROR: Question count mismatch! Original: {len(original)}, Updated: {len(updated)}")
        return None
    
    # Sample questions
    sample_size = max(1, int(len(original) * sample_pct))
    sample_indices = random.sample(range(len(original)), sample_size)
    
    print(f"\n{'='*70}")
    print(f"📋 Verifying: {bank_name}")
    print(f"{'='*70}")
    print(f"  Total questions: {len(original)}")
    print(f"  Sample size (5%): {sample_size} questions")
    print(f"  Sample indices: {sorted(sample_indices)[:10]}{'...' if len(sample_indices) > 10 else ''}")
    
    passed = 0
    failed = 0
    warnings = 0
    
    failed_details = []
    
    for idx in sample_indices:
        result = verify_question(original[idx], updated[idx], idx)
        
        if result['passed']:
            passed += 1
        else:
            failed += 1
            failed_details.append(result)
        
        if result['warnings']:
            warnings += 1
    
    # Summary
    print(f"\n  Results:")
    print(f"    ✅ Passed: {passed}/{sample_size}")
    print(f"    ❌ Failed: {failed}/{sample_size}")
    print(f"    ⚠️  Warnings: {warnings}/{sample_size}")
    
    if failed_details:
        print(f"\n  Failed Question Details:")
        for result in failed_details[:5]:  # Show first 5 failures
            print(f"\n    Question #{result['question_idx']}:")
            for error in result['errors']:
                print(f"      ❌ {error}")
    
    return {
        'bank': bank_name,
        'total': len(original),
        'sample_size': sample_size,
        'passed': passed,
        'failed': failed,
        'warnings': warnings,
        'failed_details': failed_details
    }


def show_sample_question(original_path: Path, updated_path: Path, idx: int):
    """Show a detailed comparison of a single question."""
    original = load_questions(original_path)
    updated = load_questions(updated_path)
    
    orig_q = original[idx]
    upd_q = updated[idx]
    
    print(f"\n{'='*70}")
    print(f"📝 DETAILED COMPARISON - Question #{idx}")
    print(f"{'='*70}")
    
    print(f"\n--- ORIGINAL ---")
    print(f"Question: {orig_q['questionText'][:100]}...")
    print(f"Correct Index: {orig_q['correctAnswerIndex']} ({index_to_letter(orig_q['correctAnswerIndex'])})")
    print(f"Choices:")
    for i, c in enumerate(orig_q['choices']):
        marker = "✓" if i == orig_q['correctAnswerIndex'] else " "
        print(f"  {marker} {i} ({index_to_letter(i)}): {c[:60]}...")
    print(f"Explanation: {orig_q['explanation'][:150]}...")
    
    print(f"\n--- UPDATED ---")
    print(f"Question: {upd_q['questionText'][:100]}...")
    print(f"Correct Index: {upd_q['correctAnswerIndex']} ({index_to_letter(upd_q['correctAnswerIndex'])})")
    print(f"Choices:")
    for i, c in enumerate(upd_q['choices']):
        marker = "✓" if i == upd_q['correctAnswerIndex'] else " "
        print(f"  {marker} {i} ({index_to_letter(i)}): {c[:60]}...")
    print(f"Explanation: {upd_q['explanation'][:150]}...")
    
    # Verify correctness
    orig_correct = orig_q['choices'][orig_q['correctAnswerIndex']]
    upd_correct = upd_q['choices'][upd_q['correctAnswerIndex']]
    
    print(f"\n--- VERIFICATION ---")
    print(f"Original correct answer text: {orig_correct[:60]}...")
    print(f"Updated correct answer text:  {upd_correct[:60]}...")
    print(f"Match: {'✅ YES' if orig_correct == upd_correct else '❌ NO'}")


def main():
    base_path = Path(__file__).parent
    
    banks = [
        ('People Domain', 
         base_path / 'pmp_2026_people_bank.backup.json',
         base_path / 'pmp_2026_people_bank.json'),
        ('Process Domain',
         base_path / 'pmp_2026_process_bank.backup.json', 
         base_path / 'pmp_2026_process_bank.json'),
        ('Business Domain',
         base_path / 'pmp_2026_business_bank.backup.json',
         base_path / 'pmp_2026_business_bank.json'),
    ]
    
    print("\n" + "🔍 PMP Question Bank Shuffle Verification (5% Spot Check)")
    print("=" * 70)
    
    all_results = []
    
    for bank_name, orig_path, upd_path in banks:
        if orig_path.exists() and upd_path.exists():
            result = verify_question_bank(bank_name, orig_path, upd_path, sample_pct=0.05)
            if result:
                all_results.append(result)
        else:
            print(f"\n⚠️  Files not found for {bank_name}")
    
    # Overall summary
    print(f"\n{'='*70}")
    print("📊 OVERALL SUMMARY")
    print(f"{'='*70}")
    
    total_sampled = sum(r['sample_size'] for r in all_results)
    total_passed = sum(r['passed'] for r in all_results)
    total_failed = sum(r['failed'] for r in all_results)
    total_warnings = sum(r['warnings'] for r in all_results)
    
    print(f"  Total questions checked: {total_sampled}")
    print(f"  ✅ Passed: {total_passed} ({total_passed/total_sampled*100:.1f}%)")
    print(f"  ❌ Failed: {total_failed} ({total_failed/total_sampled*100:.1f}%)")
    print(f"  ⚠️  Warnings: {total_warnings}")
    
    if total_failed == 0:
        print(f"\n  🎉 All spot-checked questions passed verification!")
    else:
        print(f"\n  ⚠️  Some questions failed verification. Review the details above.")
    
    # Show 3 random detailed examples
    print(f"\n{'='*70}")
    print("📋 SAMPLE DETAILED COMPARISONS (3 random questions)")
    print(f"{'='*70}")
    
    for bank_name, orig_path, upd_path in banks[:1]:  # Just first bank for examples
        if orig_path.exists():
            questions = load_questions(orig_path)
            sample_indices = random.sample(range(len(questions)), min(3, len(questions)))
            for idx in sample_indices:
                show_sample_question(orig_path, upd_path, idx)


if __name__ == "__main__":
    main()
