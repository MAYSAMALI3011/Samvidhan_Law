import pytest
from backend.scripts.ingest.ordinals import (
    ordinal_to_number,
    number_to_ordinal_words,
    number_to_ordinal_suffix,
)


def test_all_1_to_106_roundtrip():
    for n in range(1, 107):
        words = number_to_ordinal_words(n)
        assert ordinal_to_number(words) == n
        suffix = number_to_ordinal_suffix(n)
        assert ordinal_to_number(suffix) == n


def test_specific_amendments():
    assert ordinal_to_number("First") == 1
    assert ordinal_to_number("42nd") == 42
    assert ordinal_to_number("Forty-second") == 42
    assert ordinal_to_number("forty second") == 42
    assert ordinal_to_number("The Constitution (Forty-second Amendment) Act, 1976") == 42
    assert ordinal_to_number("042_42nd_Amendment_Act_1976.pdf") == 42
    assert ordinal_to_number("Ninety-seventh") == 97
    assert ordinal_to_number("One Hundred and Sixth") == 106
    assert ordinal_to_number("106th") == 106
    assert ordinal_to_number("100th") == 100
    assert ordinal_to_number("One Hundredth") == 100


def test_suffixes():
    assert number_to_ordinal_suffix(1) == "1st"
    assert number_to_ordinal_suffix(2) == "2nd"
    assert number_to_ordinal_suffix(3) == "3rd"
    assert number_to_ordinal_suffix(4) == "4th"
    assert number_to_ordinal_suffix(11) == "11th"
    assert number_to_ordinal_suffix(12) == "12th"
    assert number_to_ordinal_suffix(13) == "13th"
    assert number_to_ordinal_suffix(21) == "21st"
    assert number_to_ordinal_suffix(22) == "22nd"
    assert number_to_ordinal_suffix(23) == "23rd"
    assert number_to_ordinal_suffix(42) == "42nd"
    assert number_to_ordinal_suffix(106) == "106th"


def test_invalid():
    with pytest.raises(ValueError):
        ordinal_to_number("invalid text")
    with pytest.raises(ValueError):
        number_to_ordinal_words(107)
    with pytest.raises(ValueError):
        number_to_ordinal_words(0)
